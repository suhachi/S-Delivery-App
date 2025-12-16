import * as functions from "firebase-functions";
import * as admin from "firebase-admin";

admin.initializeApp();

const db = admin.firestore();

// NICEPAY Sandbox API URL
const NICEPAY_API_URL = "https://sandbox-api.nicepay.co.kr/v1/payments";

import { deliveryWebhookHandler } from './controllers/deliveryWebhook';

// ... (existing exports)

export const deliveryWebhook = functions.https.onRequest(async (req, res) => {
    // CORS 처리
    res.set("Access-Control-Allow-Origin", "*");
    res.set("Access-Control-Allow-Methods", "POST");
    res.set("Access-Control-Allow-Headers", "Content-Type");

    if (req.method === "OPTIONS") {
        res.status(204).send("");
        return;
    }

    await deliveryWebhookHandler(req, res);
});

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
