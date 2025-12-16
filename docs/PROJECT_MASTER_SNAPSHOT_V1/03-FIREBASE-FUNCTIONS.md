# 프로젝트 마스터 스냅샷 v1.0.0 - Firebase Functions

**생성일**: 2025-12-10  
**목적**: Firebase Functions 백엔드 코드 원본 보관

---

## 1. functions/package.json

```json
{
    "name": "functions",
    "scripts": {
        "lint": "eslint --ext .js,.ts .",
        "build": "tsc",
        "build:watch": "tsc --watch",
        "serve": "npm run build && firebase emulators:start --only functions",
        "shell": "npm run build && firebase functions:shell",
        "start": "npm run shell",
        "deploy": "firebase deploy --only functions",
        "logs": "firebase functions:log"
    },
    "engines": {
        "node": "20"
    },
    "main": "lib/index.js",
    "dependencies": {
        "firebase-admin": "^11.5.0",
        "firebase-functions": "^4.3.1"
    },
    "devDependencies": {
        "@types/node": "^18.0.0",
        "@typescript-eslint/eslint-plugin": "^5.12.0",
        "@typescript-eslint/parser": "^5.12.0",
        "eslint": "^8.9.0",
        "eslint-config-google": "^0.14.0",
        "eslint-plugin-import": "^2.25.4",
        "firebase-functions-test": "^3.0.0",
        "typescript": "^4.9.0"
    },
    "private": true
}
```

---

## 2. functions/tsconfig.json

```json
{
    "compilerOptions": {
        "module": "commonjs",
        "noImplicitReturns": true,
        "noUnusedLocals": true,
        "outDir": "lib",
        "sourceMap": true,
        "strict": true,
        "target": "es2017",
        "skipLibCheck": true
    },
    "compileOnSave": true,
    "include": [
        "src"
    ]
}
```

**중요**: `skipLibCheck: true`는 `node_modules`의 타입 정의 파일 충돌을 무시하기 위해 설정되었습니다.

---

## 3. functions/src/index.ts

```typescript
import * as functions from "firebase-functions";
import * as admin from "firebase-admin";

admin.initializeApp();

const db = admin.firestore();

// NICEPAY Sandbox API URL
const NICEPAY_API_URL = "https://sandbox-api.nicepay.co.kr/v1/payments";

export const nicepayConfirm = functions.https.onRequest(async (req, res) => {
    // CORS 처리
    res.set("Access-Control-Allow-Origin", "*");
    res.set("Access-Control-Allow-Methods", "POST");
    res.set("Access-Control-Allow-Headers", "Content-Type");

    if (req.method === "OPTIONS") {
        res.status(204).send("");
        return;
    }

    try {
        const { tid, amount, orderId, storeId } = req.body;

        // 환경 변수에서 시크릿 키 가져오기
        // 설정 방법: firebase functions:config:set nicepay.secret_key="..."
        // 임시 하드코딩된 클라이언트 ID (Sandbox용) - 실제 운영 시 config로 관리 권장
        const CLIENT_ID = "S2_3c07255c2859427494511252a1015694";
        const SECRET_KEY = functions.config().nicepay?.secret_key;

        if (!SECRET_KEY) {
            functions.logger.error("NICEPAY Secret Key is missing in functions config");
            // 키 미설정 시: 500 Internal Server Error와 명확한 메시지 전달
            // 프론트엔드에서는 이를 "결제 미활성화" 안내로 처리할 수 있음
            res.status(500).json({
                success: false,
                code: "NICEPAY_KEY_MISSING",
                message: "NICEPAY secret key is not configured."
            });
            return;
        }

        // Basic Auth 헤더 생성 (ClientId:SecretKey base64 인코딩)
        const authHeader = `Basic ${Buffer.from(CLIENT_ID + ":" + SECRET_KEY).toString("base64")}`;

        // NICEPAY 승인 API 호출
        const response = await fetch(`${NICEPAY_API_URL}/${tid}`, {
            method: "POST",
            headers: {
                "Authorization": authHeader,
                "Content-Type": "application/json",
            },
            body: JSON.stringify({ amount }),
        });

        const result = await response.json();

        if (response.ok && result.resultCode === "0000") {
            // 결제 성공: Firestore 주문 상태 업데이트
            const orderRef = db.collection("stores").doc(storeId).collection("orders").doc(orderId);

            await orderRef.update({
                status: "결제완료", // 또는 '접수대기'
                paymentStatus: "결제완료",
                payment: {
                    pg: "NICEPAY",
                    tid: result.tid,
                    amount: result.amount,
                    paidAt: result.paidAt,
                    cardName: result.card?.name,
                    cardNo: result.card?.no,
                },
                updatedAt: admin.firestore.FieldValue.serverTimestamp(),
            });

            res.status(200).json({ success: true, data: result });
        } else {
            // 결제 실패
            functions.logger.error("NICEPAY Confirm Failed", result);

            // 주문 상태 실패로 업데이트
            await db.collection("stores").doc(storeId).collection("orders").doc(orderId).update({
                status: "결제실패",
                paymentStatus: "결제실패",
                payment: {
                    error: result.resultMsg,
                    code: result.resultCode
                }
            });

            res.status(400).json({ success: false, error: result.resultMsg, code: result.resultCode });
        }

    } catch (error) {
        functions.logger.error("System Error", error);
        res.status(500).json({ success: false, error: "Internal Server Error" });
    }
});
```

---

## 4. functions/.eslintrc.js

```javascript
module.exports = {
  env: {
    es6: true,
    node: true,
  },
  parser: "@typescript-eslint/parser",
  parserOptions: {
    project: ["tsconfig.json", "tsconfig.dev.json"],
    sourceType: "module",
  },
  ignorePatterns: [
    "/lib/**/*", // Ignore built files.
  ],
  plugins: [
    "@typescript-eslint",
    "import",
  ],
  rules: {
    "quotes": ["error", "double"],
    "import/no-unresolved": 0,
  },
};
```

---

## 5. functions/package-lock.json

**참고**: `functions/package-lock.json` 파일은 매우 큽니다 (약 10,000줄 이상).  
전체 내용은 별도 파일 `03-FIREBASE-FUNCTIONS-PACKAGE-LOCK.md`에 포함되어 있습니다.

---

## Functions 환경 변수 설정

NICEPAY Secret Key를 설정하려면:

```bash
firebase functions:config:set nicepay.secret_key="YOUR_SECRET_KEY"
```

설정 확인:

```bash
firebase functions:config:get
```

---

## 배포 명령어

```bash
# Functions만 배포
firebase deploy --only functions

# 특정 함수만 배포
firebase deploy --only functions:nicepayConfirm
```

---

**다음 문서**: [04-DEPLOYMENT-SCRIPTS.md](./04-DEPLOYMENT-SCRIPTS.md)

