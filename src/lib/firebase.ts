import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { initializeFirestore } from 'firebase/firestore';
import { getStorage } from 'firebase/storage';
import { getMessaging, isSupported } from 'firebase/messaging';

// Firebase 설정
// 실제 프로젝트에서는 .env 파일에서 불러옵니다
const firebaseConfig = {
  apiKey: "AIzaSyCKS_ilGLymEaBjdF6oVKPKKkPc2dNCxQU",
  authDomain: "simple-delivery-app-9d347.firebaseapp.com",
  projectId: "simple-delivery-app-9d347",
  storageBucket: "simple-delivery-app-9d347.firebasestorage.app",
  messagingSenderId: "665529206596",
  appId: "1:665529206596:web:6e5542c21b7fe765a0b911",
  measurementId: "G-FZ74JXV42S"
};

// Firebase 초기화
const app = initializeApp(firebaseConfig);

// Firebase 서비스 초기화
export const auth = getAuth(app);
export const db = initializeFirestore(app, {
  ignoreUndefinedProperties: true
});
export const storage = getStorage(app);

// Firebase Cloud Messaging (FCM) - 선택적
let messaging: any = null;
if (typeof window !== 'undefined') {
  isSupported().then((supported) => {
    if (supported) {
      messaging = getMessaging(app);
    }
  });
}
export { messaging };

export default app;