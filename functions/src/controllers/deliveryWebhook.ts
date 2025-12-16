import * as functions from 'firebase-functions';
import * as admin from 'firebase-admin';

const db = admin.firestore();

// This function handles incoming webhooks from Delivery Agencies
// POST /deliveryWebhook
export const deliveryWebhookHandler = async (req: functions.https.Request, res: functions.Response) => {
    try {
        const { status, orderId, shopId } = req.body;

        console.log(`[Webhook] Received update for Order ${orderId}: ${status}`);

        if (!orderId || !status) {
            res.status(400).json({ success: false, message: 'Missing orderId or status' });
            return;
        }

        // 1. Get the order
        // FIXED: Target subcollection 'stores/default/orders' instead of root 'orders'
        const orderRef = db.collection('stores').doc('default').collection('orders').doc(orderId);
        const orderSnap = await orderRef.get();

        if (!orderSnap.exists) {
            res.status(404).json({ success: false, message: 'Order not found' });
            return;
        }

        const orderData = orderSnap.data();

        // 2. Validate Shop ID (Basic Security)
        // In production, we should verify the signature or API Key from Headers
        if (orderData?.storeId) {
            const storeSnap = await db.collection('stores').doc(orderData.storeId).get();
            const storeSettings = storeSnap.data()?.settings?.deliverySettings;

            if (storeSettings?.shopId && storeSettings.shopId !== shopId) {
                // Log warning but maybe proceed or block depending on strictness
                console.warn(`[Webhook] Shop ID mismatch. Configured: ${storeSettings.shopId}, Received: ${shopId}`);
            }
        }

        // 3. Map External Status to Internal Status
        // Example: Maps various provider statuses to our simpler internal statuses
        let internalStatus = '';

        switch (status.toUpperCase()) {
            case 'ACCEPTED':
            case 'ASSIGNED':
                internalStatus = '배달접수'; // New status for "Rider assigned but not picked up yet"
                break;
            case 'PICKUP':
            case 'PICKED_UP':
                internalStatus = '배달중';
                break;
            case 'COMPLETE':
            case 'DELIVERED':
                internalStatus = '완료';
                break;
            case 'CANCELED':
                internalStatus = '주문취소'; // Or keep as is and just mark delivery as canceled
                break;
            default:
                console.log(`[Webhook] Unmapped status: ${status}. Ignoring state change.`);
                res.status(200).json({ success: true, message: 'Status received but no state change required' });
                return;
        }

        // 4. Update Order
        await orderRef.update({
            status: internalStatus,
            deliveryStatus: status, // Keep the raw external status
            updatedAt: admin.firestore.FieldValue.serverTimestamp()
        });

        res.status(200).json({ success: true });

    } catch (error) {
        console.error('[Webhook] Error:', error);
        res.status(500).json({ success: false, error: 'Internal Server Error' });
    }
};
