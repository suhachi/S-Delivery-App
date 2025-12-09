# Environment Setup Guide

## Client-Side Environment Variables (.env)
The frontend uses Vite, so all client-exposed variables must be prefixed with `VITE_`.

### Firebase
Standard Firebase configuration keys.
- `VITE_FIREBASE_API_KEY`
- `VITE_FIREBASE_AUTH_DOMAIN`
- `...`

### NICEPAY (Payment)
Keys required for the NICEPAY JS SDK to function in the browser.
- `VITE_NICEPAY_CLIENT_ID`: Your NICEPAY Client Key (publicly safe).
- `VITE_NICEPAY_RETURN_URL`: The URL where NICEPAY will redirect after authentication (e.g., `http://localhost:5173/nicepay/return`).

## Server-Side Environment Variables (Firebase Functions)
**CRITICAL SECURITY WARNING**: Never place secret keys in the `.env` file of the React application.

### NICEPAY Secret Key
The Secret Key is used to call the NICEPAY Approval API (`https://sandbox-api.nicepay.co.kr/v1/payments/{tid}`) and must be kept secure.

**How to set:**
Do NOT use `.env`. Use Firebase Functions configuration:
```bash
firebase functions:config:set nicepay.secret_key="YOUR_SECRET_KEY"
```

**Accessing in Functions:**
In your TypeScript code:
```typescript
import * as functions from 'firebase-functions';
const secretKey = functions.config().nicepay.secret_key;
```
