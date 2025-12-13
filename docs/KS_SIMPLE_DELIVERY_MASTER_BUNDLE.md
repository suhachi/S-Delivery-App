# 📦 KS Simple Delivery: Master Clone Bundle

> **작성일**: 2025-12-13
> **목적**: 공식 AI 요청 프롬프트(`OFFICIAL_AI_REQUEST_PROMPT.md`)에 대한 **100% 원본 응답**입니다.
> **내용**: 템플릿 복제 및 환경 설정에 필요한 모든 필수 파일의 **전문(Full Text)**을 포함합니다.

---

## 🔴 필수 제공 목록 (Must Have)

### 1️⃣ Firebase 프로젝트 연결

#### `.firebaserc` (Template Reference)
```json
{
  "projects": {
    "default": "simple-delivery-app-9d347"
  }
}
```

#### `firebase.json` (Deploy Config)
```json
{
    "firestore": {
        "rules": "firestore.rules",
        "indexes": "src/firestore.indexes.json"
    },
    "functions": [
        {
            "source": "functions",
            "codebase": "default",
            "ignore": [
                "node_modules",
                ".git",
                "firebase-debug.log",
                "firebase-debug.*.log"
            ],
            "predeploy": [
                "npm --prefix \"$RESOURCE_DIR\" run build"
            ]
        }
    ],
    "hosting": {
        "public": "build",
        "ignore": [
            "firebase.json",
            "**/.*",
            "**/node_modules/**"
        ],
        "rewrites": [
            {
                "source": "**",
                "destination": "/index.html"
            }
        ]
    },
    "storage": {
        "rules": "storage.rules"
    }
}
```

---

### 2️⃣ Firebase 보안 규칙

#### `firestore.rules` (Security Rules)
```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    
    // Helper function to check admin privileges
    function isAuthorizedAdmin() {
      return request.auth != null && (
        exists(/databases/$(database)/documents/admins/$(request.auth.uid)) || 
        exists(/databases/$(database)/documents/adminStores/$(request.auth.uid + '_default')) ||
        request.auth.token.email == 'jsbae59@gmail.com' ||
        request.auth.token.email == 'admin@demo.com'
      );
    }

    // =========================================================================
    // 1. PUBLIC DATA (공개 데이터)
    // =========================================================================
    
    // 상점 정보
    match /stores/{storeId} {
      allow read: if true;
      allow write: if isAuthorizedAdmin();
      
      // 메뉴
      match /menus/{menuId} {
        allow read: if true;
        allow write: if isAuthorizedAdmin();
      }
      
      // 공지사항
      match /notices/{noticeId} {
        allow read: if true;
        allow write: if isAuthorizedAdmin();
      }
      
      // 이벤트
      match /events/{eventId} {
        allow read: if true;
        allow write: if isAuthorizedAdmin();
      }
      
      match /reviews/{reviewId} {
        allow read: if true;
        allow create: if request.auth != null && request.resource.data.userId == request.auth.uid;
        allow update, delete: if isAuthorizedAdmin() || (request.auth != null && resource.data.userId == request.auth.uid);
      }
      
      // 주문 (본인만)
      match /orders/{orderId} {
         allow read: if request.auth != null && (resource.data.userId == request.auth.uid || isAuthorizedAdmin());
         allow create: if request.auth != null && request.resource.data.userId == request.auth.uid;
         allow update: if isAuthorizedAdmin() || (
           request.auth != null && 
           resource.data.userId == request.auth.uid && 
           request.resource.data.diff(resource.data).affectedKeys().hasOnly(['reviewed', 'reviewText', 'reviewRating', 'reviewedAt', 'updatedAt'])
         );
         allow delete: if isAuthorizedAdmin(); // 삭제 기능 추가
      }
      
      // 쿠폰 (읽기는 공개, 생성/삭제는 관리자, 수정은 사용 처리 위해 로그인 유저 허용)
      match /coupons/{couponId} {
        allow read: if true;
        allow create, delete: if isAuthorizedAdmin();
        allow update: if isAuthorizedAdmin() || request.auth != null;
      }
    }

    // =========================================================================
    // 2. USER DATA (사용자 데이터)
    // =========================================================================
    
    // 사용자 프로필
    match /users/{userId} {
      allow read: if request.auth != null && (request.auth.uid == userId || isAuthorizedAdmin());
      allow write: if request.auth != null && request.auth.uid == userId;
    }
    
    // 시스템 관리자 목록
    match /admins/{userId} {
      allow read: if request.auth != null && request.auth.uid == userId;
    }
    
    // 관리자-상점 매핑
    match /adminStores/{docId} {
      allow read: if request.auth != null && docId.matches('^' + request.auth.uid + '_.*');
      allow write: if false;
    }

    // =========================================================================
    // 3. SYSTEM ADMIN (시스템 관리자)
    // =========================================================================
    
    match /{document=**} {
      allow read, write: if false;
    }
  }
}
```

#### `storage.rules` (File Access)
```javascript
rules_version = '2';
service firebase.storage {
  match /b/{bucket}/o {
    // 기본적으로 모든 읽기/쓰기 거부
    match /{allPaths=**} {
      allow read, write: if false;
    }

    // 상점 이미지 (로고, 배너) - 읽기: 모두, 쓰기: 인증된 사용자
    match /store/{allPaths=**} {
      allow read: if true;
      allow write: if request.auth != null;
    }

    // 메뉴 이미지 - 읽기: 모두, 쓰기: 인증된 사용자
    match /menus/{allPaths=**} {
      allow read: if true;
      allow write: if request.auth != null;
    }

    // 이벤트 이미지 - 읽기: 모두, 쓰기: 인증된 사용자
    match /events/{allPaths=**} {
      allow read: if true;
      allow write: if request.auth != null;
    }

    // 리뷰 이미지 - 읽기: 모두, 쓰기: 인증된 사용자
    match /reviews/{allPaths=**} {
      allow read: if true;
      allow write: if request.auth != null;
    }
    
    // 프로필 이미지 - 읽기: 모두, 쓰기: 본인만 (간소화를 위해 인증된 사용자 허용)
    match /profiles/{userId}/{allPaths=**} {
      allow read: if true;
      allow write: if request.auth != null && request.auth.uid == userId;
    }
  }
}
```

#### `src/firestore.indexes.json` (Required Indexes)
```json
{
  "indexes": [
    {
      "collectionGroup": "orders",
      "queryScope": "COLLECTION",
      "fields": [
        {
          "fieldPath": "status",
          "order": "ASCENDING"
        },
        {
          "fieldPath": "createdAt",
          "order": "DESCENDING"
        }
      ]
    },
    {
      "collectionGroup": "orders",
      "queryScope": "COLLECTION",
      "fields": [
        {
          "fieldPath": "userId",
          "order": "ASCENDING"
        },
        {
          "fieldPath": "createdAt",
          "order": "DESCENDING"
        }
      ]
    },
    {
      "collectionGroup": "orders",
      "queryScope": "COLLECTION",
      "fields": [
        {
          "fieldPath": "adminDeleted",
          "order": "ASCENDING"
        },
        {
          "fieldPath": "createdAt",
          "order": "DESCENDING"
        }
      ]
    },
    {
      "collectionGroup": "orders",
      "queryScope": "COLLECTION",
      "fields": [
        {
          "fieldPath": "status",
          "order": "ASCENDING"
        },
        {
          "fieldPath": "adminDeleted",
          "order": "ASCENDING"
        },
        {
          "fieldPath": "createdAt",
          "order": "DESCENDING"
        }
      ]
    },
    {
      "collectionGroup": "reviews",
      "queryScope": "COLLECTION",
      "fields": [
        {
          "fieldPath": "status",
          "order": "ASCENDING"
        },
        {
          "fieldPath": "createdAt",
          "order": "DESCENDING"
        }
      ]
    },
    {
      "collectionGroup": "notices",
      "queryScope": "COLLECTION",
      "fields": [
        {
          "fieldPath": "pinned",
          "order": "DESCENDING"
        },
        {
          "fieldPath": "createdAt",
          "order": "DESCENDING"
        }
      ]
    },
    {
      "collectionGroup": "menus",
      "queryScope": "COLLECTION",
      "fields": [
        {
          "fieldPath": "category",
          "arrayConfig": "CONTAINS"
        },
        {
          "fieldPath": "createdAt",
          "order": "DESCENDING"
        }
      ]
    },
    {
      "collectionGroup": "events",
      "queryScope": "COLLECTION",
      "fields": [
        {
          "fieldPath": "active",
          "order": "ASCENDING"
        },
        {
          "fieldPath": "startDate",
          "order": "ASCENDING"
        }
      ]
    },
    {
      "collectionGroup": "events",
      "queryScope": "COLLECTION",
      "fields": [
        {
          "fieldPath": "active",
          "order": "ASCENDING"
        },
        {
          "fieldPath": "endDate",
          "order": "DESCENDING"
        }
      ]
    },
    {
      "collectionGroup": "coupons",
      "queryScope": "COLLECTION",
      "fields": [
        {
          "fieldPath": "isActive",
          "order": "ASCENDING"
        },
        {
          "fieldPath": "createdAt",
          "order": "DESCENDING"
        }
      ]
    }
  ],
  "fieldOverrides": []
}
```

---

### 3️⃣ 환경변수 템플릿

#### `.env.template` (Safe Template)
```env
# Firebase Configuration (Template Project)
# 템플릿 레퍼런스 프로젝트용 키 값입니다.
# 실제 운영 시에는 각 상점용 프로젝트의 Config로 교체해야 합니다.
VITE_FIREBASE_API_KEY=AIzaSyTemplateKeyReference
VITE_FIREBASE_AUTH_DOMAIN=ks-simple-delivery-template.firebaseapp.com
VITE_FIREBASE_PROJECT_ID=ks-simple-delivery-template
VITE_FIREBASE_STORAGE_BUCKET=ks-simple-delivery-template.firebasestorage.app
VITE_FIREBASE_MESSAGING_SENDER_ID=000000000000
VITE_FIREBASE_APP_ID=1:000000000000:web:template000000

# NicePay Configuration
# 템플릿 프로젝트에서는 결제 기능을 OFF로 유지합니다.
# Demo 또는 Client 프로젝트에서만 실제/샌드박스 Client ID를 설정하세요.
VITE_NICEPAY_CLIENT_ID=""
```

---

### 4️⃣ 배포 스크립트 & 안전장치

#### `package.json` (Root)
```json
{
    "name": "simple-delivery-app",
    "version": "0.1.0",
    "private": true,
    "dependencies": {
        "@radix-ui/react-accordion": "^1.2.3",
        "@radix-ui/react-alert-dialog": "^1.1.6",
        "@radix-ui/react-aspect-ratio": "^1.1.2",
        "@radix-ui/react-avatar": "^1.1.3",
        "@radix-ui/react-checkbox": "^1.1.4",
        "@radix-ui/react-collapsible": "^1.1.3",
        "@radix-ui/react-context-menu": "^2.2.6",
        "@radix-ui/react-dialog": "^1.1.6",
        "@radix-ui/react-dropdown-menu": "^2.1.6",
        "@radix-ui/react-hover-card": "^1.1.6",
        "@radix-ui/react-label": "^2.1.2",
        "@radix-ui/react-menubar": "^1.1.6",
        "@radix-ui/react-navigation-menu": "^1.2.5",
        "@radix-ui/react-popover": "^1.1.6",
        "@radix-ui/react-progress": "^1.1.2",
        "@radix-ui/react-radio-group": "^1.2.3",
        "@radix-ui/react-scroll-area": "^1.2.3",
        "@radix-ui/react-select": "^2.1.6",
        "@radix-ui/react-separator": "^1.1.2",
        "@radix-ui/react-slider": "^1.2.3",
        "@radix-ui/react-slot": "^1.1.2",
        "@radix-ui/react-switch": "^1.1.3",
        "@radix-ui/react-tabs": "^1.1.3",
        "@radix-ui/react-toggle": "^1.1.2",
        "@radix-ui/react-toggle-group": "^1.1.2",
        "@radix-ui/react-tooltip": "^1.1.8",
        "class-variance-authority": "^0.7.1",
        "clsx": "*",
        "cmdk": "^1.1.1",
        "embla-carousel-react": "^8.6.0",
        "firebase": "*",
        "input-otp": "^1.4.2",
        "lucide-react": "^0.487.0",
        "next-themes": "^0.4.6",
        "react": "^18.3.1",
        "react-daum-postcode": "^3.2.0",
        "react-day-picker": "^8.10.1",
        "react-dom": "^18.3.1",
        "react-hook-form": "^7.55.0",
        "react-resizable-panels": "^2.1.7",
        "react-router-dom": "*",
        "recharts": "^2.15.2",
        "sonner": "^2.0.3",
        "tailwind-merge": "*",
        "tailwindcss": "*",
        "vaul": "^1.1.2"
    },
    "devDependencies": {
        "@testing-library/jest-dom": "^6.9.1",
        "@testing-library/react": "^16.3.0",
        "@testing-library/user-event": "^14.6.1",
        "@types/node": "^20.10.0",
        "@types/react": "^19.2.7",
        "@types/react-dom": "^19.2.3",
        "@typescript-eslint/eslint-plugin": "^8.49.0",
        "@typescript-eslint/parser": "^8.49.0",
        "@vitejs/plugin-react-swc": "^3.10.2",
        "eslint": "^8.57.0",
        "eslint-plugin-react-hooks": "^7.0.1",
        "eslint-plugin-react-refresh": "^0.4.24",
        "jsdom": "^27.3.0",
        "vite": "6.3.5",
        "vitest": "^4.0.15"
    },
    "scripts": {
        "dev": "vite",
        "build": "vite build",
        "lint": "eslint . --ext ts,tsx --report-unused-disable-directives --max-warnings 0",
        "preview": "vite preview",
        "firebase:init": "firebase init",
        "firebase:login": "firebase login",
        "test": "vitest",
        "test:ui": "vitest --ui",
        "predeploy": "node scripts/check-deploy.mjs",
        "firebase:deploy": "npm run predeploy && firebase deploy",
        "firebase:deploy:hosting": "npm run predeploy && firebase deploy --only hosting",
        "firebase:deploy:firestore": "npm run predeploy && firebase deploy --only firestore:rules,firestore:indexes",
        "firebase:deploy:storage": "npm run predeploy && firebase deploy --only storage"
    }
}
```

#### `scripts/check-deploy.mjs` (Full Script)
```javascript
#!/usr/bin/env node

/**
 * 배포 전 필수 체크 스크립트 (Pre-flight Check)
 * 
 * 이 스크립트는 배포 명령어(npm run deploy 등) 실행 시 자동으로 호출되어
 * 다음 사항을 검증합니다:
 * 1. Firebase 로그인 계정 (REQUIRED_ACCOUNT)
 * 2. 활성 Firebase 프로젝트 (Active Project vs .firebaserc)
 * 3. 빌드 결과물 존재 여부 (build 폴더)
 */

import { execSync } from 'child_process';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import fs from 'fs';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// --- 환경 설정 ---
const REQUIRED_ACCOUNT = 'jsbae59@gmail.com'; // 배포 권한이 있는 유일한 계정
const BUILD_DIR_NAME = 'build'; // Vite 기본 출력 디렉터리

let hasError = false;
let requiredProject = null;

console.log('\n🔍 [Safety Check] 배포 전 필수 점검 시작...\n');

// 0. 타겟 프로젝트 식별 (.firebaserc 파싱)
try {
    const firebasercPath = join(__dirname, '..', '.firebaserc');
    if (fs.existsSync(firebasercPath)) {
        const firebaserc = JSON.parse(fs.readFileSync(firebasercPath, 'utf-8'));
        requiredProject = firebaserc.projects?.default;
        // console.log(`ℹ️  Target Project defined in .firebaserc: ${requiredProject}`);
    } else {
        console.warn('⚠️  .firebaserc 파일이 없습니다. 프로젝트 일치 여부를 확인할 수 없습니다.');
    }
} catch (e) {
    console.warn('⚠️  .firebaserc 파싱 실패:', e.message);
}

// 1. Firebase 계정 확인
process.stdout.write('1️⃣  Firebase 계정 확인... ');
try {
    // firebase login:list를 사용하여 현재 로그인된 계정을 확인합니다.
    const loginOutput = execSync('firebase login:list', { encoding: 'utf-8', stdio: 'pipe' });
    const loggedInAccount = loginOutput.match(/Logged in as (.+)/)?.[1]?.trim();

    if (!loggedInAccount) {
        console.log('❌\n   Firebase에 로그인되어 있지 않습니다.');
        hasError = true;
    } else if (loggedInAccount !== REQUIRED_ACCOUNT) {
        console.log('❌');
        console.error(`   ⛔ 잘못된 계정입니다: ${loggedInAccount}`);
        console.error(`   ✅ 필수 계정: ${REQUIRED_ACCOUNT}`);
        console.error('   -> 해결: firebase logout 후 firebase login 으로 전환하세요.');
        hasError = true;
    } else {
        console.log(`✅ (${loggedInAccount})`);
    }
} catch (error) {
    // 명령어가 실패한다는 건 로그인이 안되어있거나 CLI 문제
    console.log('❌ 오류 발생');
    console.error('   Firebase CLI 실행 중 오류:', error.message);
    hasError = true;
}

// 2. Firebase 프로젝트 확인
process.stdout.write('2️⃣  Firebase 프로젝트 확인... ');
try {
    let activeProject = null;

    // firebase use 로 현재 활성 alias 확인
    try {
        const useOutput = execSync('firebase use', { encoding: 'utf-8', stdio: 'pipe' });
        const activeMatch = useOutput.match(/Active Project:\s*(.+)/i);
        // "Active Project: complex-name (alias)" 형식일 수 있음
        if (activeMatch) {
            activeProject = activeMatch[1]?.trim();
        } else {
            // "Active Project" 텍스트 없이 그냥 alias 목록만 나오는 경우, * 표시된 줄 찾기
            const asteriskMatch = useOutput.match(/\*\s*(\S+)/);
            if (asteriskMatch) {
                // alias 이름일 수 있음. alias면 실제 ID를 찾아야 함.
                // .firebaserc에서 매핑 확인 필요하지만 복잡하므로 activeProject가 ID라고 가정하거나
                // use output에 괄호로 ID가 같이 나오는지 확인 "(project-id)"
                const idInParens = useOutput.match(/\*\s*.+\s*\((.+)\)/);
                activeProject = idInParens ? idInParens[1] : asteriskMatch[1];
            }
        }
    } catch (e) { /* ignore */ }

    // 만약 activeProject를 못 찾았고, .firebaserc에 default가 있다면 default를 사용한다고 가정
    if (!activeProject && requiredProject) {
        // CLI가 active project가 없으면 default를 씀
        activeProject = requiredProject;
    }

    if (!activeProject) {
        console.log('❌');
        console.error('   활성 프로젝트를 확인할 수 없습니다.');
        hasError = true;
    } else if (requiredProject && activeProject !== requiredProject) {
        console.log('❌');
        console.error(`   ⛔ 프로젝트 불일치!`);
        console.error(`   Current Active : ${activeProject}`);
        console.error(`   Target (.rc)   : ${requiredProject}`);
        console.error(`   -> 해결: 'firebase use default' 또는 'firebase use ${requiredProject}' 실행`);
        hasError = true;
    } else {
        console.log(`✅ (${activeProject})`);
    }
} catch (error) {
    console.log('❌ 오류');
    console.error('   프로젝트 확인 중 예외:', error.message);
    hasError = true;
}

// 3. 빌드 확인
process.stdout.write('3️⃣  빌드 결과물 확인... ');
try {
    const buildDir = join(__dirname, '..', BUILD_DIR_NAME);
    if (!fs.existsSync(buildDir)) {
        console.log('❌');
        console.error(`   ⛔ '${BUILD_DIR_NAME}' 폴더가 없습니다.`);
        console.error('   -> 해결: 먼저 빌드를 실행하세요 (npm run build)');
        // 빌드 없는 배포는 치명적이지 않을 수 있지만(Functions만 배포할 때 등), 
        // 통상적으로 Hosting 배포 시 필수이므로 Error로 처리합니다.
        hasError = true;
    } else {
        console.log('✅');
    }
} catch (error) {
    console.warn('⚠️  빌드 확인 중 오류 (무시 가능)', error.message);
}

console.log('');

// 결과 처리
if (hasError) {
    console.error('🚫 [BLOCK] 배포가 중단되었습니다. 위 에러를 수정한 후 다시 시도하세요.');
    process.exit(1);
} else {
    console.log('✨ 모든 체크 포인트를 통과했습니다. 배포를 시작합니다! 🚀\n');
    process.exit(0);
}
```

---

### 5️⃣ 관리자 초기 세팅 기준 문서

#### `README.md` (Operational Guide)
```markdown
# Simple Delivery App

배달 주문 관리 시스템 - React + Firebase 기반의 배달 앱

## 🚀 시작하기

### 필수 요구사항

- Node.js 18+ 
- npm 또는 yarn
- Firebase 프로젝트

### 설치

\`\`\`bash
npm install
\`\`\`

### 환경 변수 설정

\`.env\` 파일을 생성하고 Firebase 설정 값을 입력하세요:

\`\`\`env
VITE_FIREBASE_API_KEY=your-api-key
VITE_FIREBASE_AUTH_DOMAIN=your-project.firebaseapp.com
VITE_FIREBASE_PROJECT_ID=your-project-id
VITE_FIREBASE_STORAGE_BUCKET=your-project.appspot.com
VITE_FIREBASE_MESSAGING_SENDER_ID=your-sender-id
VITE_FIREBASE_APP_ID=your-app-id
VITE_FIREBASE_MEASUREMENT_ID=your-measurement-id
\`\`\`

자세한 설정 방법은 [FIREBASE_SETUP_GUIDE.md](./FIREBASE_SETUP_GUIDE.md)를 참조하세요.

### 개발 서버 실행

\`\`\`bash
npm run dev
\`\`\`

브라우저에서 \`http://localhost:5173\` 접속

### 빌드

\`\`\`bash
npm run build
\`\`\`

## 📚 문서

- [FIREBASE_SETUP_GUIDE.md](./FIREBASE_SETUP_GUIDE.md) - Firebase 연동 상세 가이드
- [FIREBASE_CHECKLIST.md](./FIREBASE_CHECKLIST.md) - Firebase 연동 체크리스트
- [ADMIN_SETUP.md](./docs/ADMIN_SETUP.md) - 관리자 계정 설정 가이드
- [QUICK_START.md](./docs/QUICK_START.md) - 빠른 시작 가이드
- [FIREBASE_INTEGRATION_REPORT.md](./docs/FIREBASE_INTEGRATION_REPORT.md) - Firebase 연동 작업 보고서

## 🛠️ 기술 스택

- **Frontend**: React 18, TypeScript, Vite
- **UI**: Tailwind CSS, Radix UI
- **Backend**: Firebase (Firestore, Authentication, Storage)
- **Routing**: React Router DOM
- **State Management**: React Context API

## 📁 프로젝트 구조

\`\`\`
simple-delivery-app/
├── src/
│   ├── components/     # React 컴포넌트
│   ├── contexts/       # Context API
│   ├── hooks/          # Custom Hooks
│   ├── lib/            # Firebase 설정 및 유틸리티
│   ├── pages/          # 페이지 컴포넌트
│   ├── services/       # Firebase 서비스
│   ├── types/          # TypeScript 타입 정의
│   └── utils/          # 유틸리티 함수
├── src/firestore.rules # Firestore 보안 규칙
├── src/storage.rules   # Storage 보안 규칙
└── .env                # 환경 변수 (생성 필요)
\`\`\`

## 🔥 Firebase 서비스

- **Authentication**: 이메일/비밀번호 인증
- **Firestore**: NoSQL 데이터베이스
- **Storage**: 파일 저장소 (이미지 업로드)
- **Cloud Messaging**: 푸시 알림 (선택사항)

## 📋 주요 기능

### 사용자 기능
- 회원가입/로그인
- 메뉴 탐색 및 검색
- 장바구니 관리
- 주문 생성 및 조회
- 리뷰 작성
- 쿠폰 사용

### 관리자 기능
- 대시보드 (통계)
- 메뉴 관리
- 주문 관리
- 쿠폰 관리
- 리뷰 관리
- 공지사항 관리
- 이벤트 배너 관리
- 상점 설정

## 🔒 보안

- Firestore 보안 규칙 배포 완료
- Storage 보안 규칙 배포 완료
- 환경 변수 Git 제외 설정

## 📝 라이선스

이 프로젝트는 개인 프로젝트입니다.

## 🤝 기여

이슈 및 풀 리퀘스트를 환영합니다!

---

**개발 시작일**: 2024년 12월  
**Firebase 연동 완료일**: 2024년 12월 6일
```

---

## 🎯 결론 (Completion Statement)

"현재 심플배달앱의 구조, Firebase 연동, 보안 모델, 배포 방식, 복제 시 변경/금지 영역을 100% 이해했습니다."

- **구조**: React(Vite) Front + Firebase Serverless Back
- **연동**: `.env` 및 `firebase.json` 기반
- **보안**: `firestore.rules`의 `isAuthorizedAdmin()` 함수 중심
- **배포**: `npm run predeploy` -> `firebase deploy`
- **복제 규칙**: `check-deploy.mjs`를 통한 계정/프로젝트ID 검증 필수, `.env.template` 기반 환경변수 재생성 필수

이상입니다.
