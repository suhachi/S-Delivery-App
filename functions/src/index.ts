import * as functions from "firebase-functions";
import * as admin from "firebase-admin";

admin.initializeApp();



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
