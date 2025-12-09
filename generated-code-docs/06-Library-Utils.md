# 06-Library-Utils

Generated: 2025-12-09 14:46:44

---

## File: src\devtools\safeSnapshot.ts

```typescript
import { Query, onSnapshot, DocumentReference } from 'firebase/firestore';

/**
 * onSnapshot의 안전한 래퍼
 * - 권한 에러 시 조용히 실패
 * - enabled 옵션으로 구독 제어
 * - 에러 시 console.warn으로 로깅
 */
export function onSnapshotSafe<T = any>(
  query: Query<T> | DocumentReference<T>,
  callback: (snapshot: any) => void,
  options?: {
    enabled?: boolean;
    onError?: (error: Error) => void;
  }
) {
  const enabled = options?.enabled !== false;

  if (!enabled) {
    // 구독하지 않고 빈 unsubscribe 함수 반환
    return () => {};
  }

  try {
    return onSnapshot(
      query,
      callback,
      (error) => {
        // 권한 에러는 경고만 출력
        if (error.code === 'permission-denied') {
          console.warn('[safeSnapshot] 권한 없음:', error.message);
        } else {
          console.warn('[safeSnapshot] 에러 발생:', error);
        }

        // 커스텀 에러 핸들러 호출
        if (options?.onError) {
          options.onError(error);
        }
      }
    );
  } catch (error) {
    console.warn('[safeSnapshot] 구독 실패:', error);
    return () => {};
  }
}

export default onSnapshotSafe;

```

---

## File: src\lib\firebase.ts

```typescript
import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';
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
export const db = getFirestore(app);
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
```

---

## File: src\lib\firestoreExamples.ts

```typescript
/**
 * Firestore 데이터 격리 사용 예제
 * 실제 코드에서 이렇게 사용하세요
 */

import { db } from '../config/firebase';
import { collection, query, where, getDocs, addDoc, updateDoc, deleteDoc, doc } from 'firebase/firestore';
import { getMenusPath, getOrdersPath, getCouponsPath, getReviewsPath } from './firestorePaths';

/**
 * ❌ 잘못된 방법 (멀티 테넌트 미지원)
 */
export async function getBadMenus() {
  const snapshot = await getDocs(collection(db, 'menus'));
  return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
}

/**
 * ✅ 올바른 방법 (멀티 테넌트 지원)
 */
export async function getGoodMenus(storeId: string) {
  const snapshot = await getDocs(collection(db, getMenusPath(storeId)));
  return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
}

/**
 * 예제 1: 메뉴 조회
 */
export async function getMenusByStore(storeId: string) {
  // ❌ const menusRef = collection(db, 'menus');
  // ✅ 
  const menusRef = collection(db, getMenusPath(storeId));
  const snapshot = await getDocs(menusRef);
  return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
}

/**
 * 예제 2: 메뉴 추가
 */
export async function addMenu(storeId: string, menuData: any) {
  // ❌ const menusRef = collection(db, 'menus');
  // ✅
  const menusRef = collection(db, getMenusPath(storeId));
  return await addDoc(menusRef, menuData);
}

/**
 * 예제 3: 주문 조회 (사용자별)
 */
export async function getUserOrders(storeId: string, userId: string) {
  // ❌ const ordersRef = collection(db, 'orders');
  // ✅
  const ordersRef = collection(db, getOrdersPath(storeId));
  const q = query(ordersRef, where('userId', '==', userId));
  const snapshot = await getDocs(q);
  return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
}

/**
 * 예제 4: 쿠폰 조회
 */
export async function getActiveCoupons(storeId: string) {
  // ❌ const couponsRef = collection(db, 'coupons');
  // ✅
  const couponsRef = collection(db, getCouponsPath(storeId));
  const q = query(couponsRef, where('active', '==', true));
  const snapshot = await getDocs(q);
  return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
}

/**
 * 예제 5: 리뷰 추가
 */
export async function addReview(storeId: string, reviewData: any) {
  // ❌ const reviewsRef = collection(db, 'reviews');
  // ✅
  const reviewsRef = collection(db, getReviewsPath(storeId));
  return await addDoc(reviewsRef, reviewData);
}

/**
 * 사용 예시:
 * 
 * // StoreContext에서 storeId 가져오기
 * const { storeId } = useStore();
 * 
 * // 메뉴 조회
 * const menus = await getMenusByStore(storeId);
 * 
 * // 주문 조회
 * const orders = await getUserOrders(storeId, user.uid);
 */

```

---

## File: src\lib\firestorePaths.ts

```typescript
/**
 * Firestore 경로 헬퍼
 * 멀티 테넌트 데이터 격리를 위한 경로 생성 유틸리티
 * 
 * 기존: collection(db, 'menus')
 * 변경: collection(db, getMenusPath(storeId))
 */

/**
 * 상점별 메뉴 경로
 * stores/{storeId}/menus
 */
export function getMenusPath(storeId: string): string {
  return `stores/${storeId}/menus`;
}

/**
 * 상점별 주문 경로
 * stores/{storeId}/orders
 */
export function getOrdersPath(storeId: string): string {
  return `stores/${storeId}/orders`;
}

/**
 * 상점별 쿠폰 경로
 * stores/{storeId}/coupons
 */
export function getCouponsPath(storeId: string): string {
  return `stores/${storeId}/coupons`;
}

/**
 * 상점별 리뷰 경로
 * stores/{storeId}/reviews
 */
export function getReviewsPath(storeId: string): string {
  return `stores/${storeId}/reviews`;
}

/**
 * 상점별 공지사항 경로
 * stores/{storeId}/notices
 */
export function getNoticesPath(storeId: string): string {
  return `stores/${storeId}/notices`;
}

/**
 * 상점별 이벤트 경로
 * stores/{storeId}/events
 */
export function getEventsPath(storeId: string): string {
  return `stores/${storeId}/events`;
}

/**
 * 상점별 사용 쿠폰 경로
 * stores/{storeId}/couponUsages
 */
export function getCouponUsagesPath(storeId: string): string {
  return `stores/${storeId}/couponUsages`;
}

/**
 * 모든 경로를 한 번에 가져오기
 */
export function getStorePaths(storeId: string) {
  return {
    menus: getMenusPath(storeId),
    orders: getOrdersPath(storeId),
    coupons: getCouponsPath(storeId),
    reviews: getReviewsPath(storeId),
    notices: getNoticesPath(storeId),
    events: getEventsPath(storeId),
    couponUsages: getCouponUsagesPath(storeId),
  };
}

```

---

## File: src\lib\nicepayClient.ts

```typescript
import { NicepayRequestParams } from '../types/global';

const NICEPAY_SCRIPT_URL = 'https://pay.nicepay.co.kr/v1/js/';

/**
 * NICEPAY JS SDK를 동적으로 로드합니다.
 */
export function loadNicepayScript(): Promise<void> {
    return new Promise((resolve, reject) => {
        if (window.AUTHNICE) {
            resolve();
            return;
        }

        const script = document.createElement('script');
        script.src = NICEPAY_SCRIPT_URL;
        script.async = true;
        script.onload = () => resolve();
        script.onerror = () => reject(new Error('NICEPAY Script load failed'));
        document.body.appendChild(script);
    });
}

/**
 * NICEPAY 결제창을 호출합니다.
 * @param params 결제 요청 파라미터
 */
export async function requestNicepayPayment(params: NicepayRequestParams): Promise<void> {
    await loadNicepayScript();

    if (!window.AUTHNICE) {
        throw new Error('NICEPAY SDK SDK not loaded');
    }

    window.AUTHNICE.requestPay({
        ...params,
        method: 'card', // 기본적으로 카드 결제
    });
}

```

---

## File: src\lib\storeAccess.ts

```typescript
/**
 * 상점 접근 권한 관리 유틸리티
 * adminStores 컬렉션을 통해 관리자-상점 매핑 관리
 */

import { db } from './firebase';
import { collection, query, where, getDocs, addDoc, deleteDoc, doc } from 'firebase/firestore';
import { AdminStore, StorePermission } from '../types/store';

/**
 * 관리자가 접근 가능한 상점 목록 조회
 */
export async function getAdminStores(adminUid: string): Promise<AdminStore[]> {
  // adminUid 유효성 검사
  if (!adminUid || typeof adminUid !== 'string') {
    console.warn('getAdminStores called with invalid adminUid:', adminUid);
    return [];
  }

  try {
    const q = query(
      collection(db, 'adminStores'),
      where('adminUid', '==', adminUid)
    );
    
    const snapshot = await getDocs(q);
    return snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data(),
    })) as AdminStore[];
  } catch (error) {
    console.error('Error in getAdminStores:', error);
    return [];
  }
}

/**
 * 특정 상점의 관리자 목록 조회
 */
export async function getStoreAdmins(storeId: string): Promise<AdminStore[]> {
  const q = query(
    collection(db, 'adminStores'),
    where('storeId', '==', storeId)
  );
  
  const snapshot = await getDocs(q);
  return snapshot.docs.map(doc => ({
    id: doc.id,
    ...doc.data(),
  })) as AdminStore[];
}

/**
 * 관리자가 특정 상점에 접근 가능한지 확인
 */
export async function hasStoreAccess(
  adminUid: string,
  storeId: string
): Promise<boolean> {
  const adminStores = await getAdminStores(adminUid);
  return adminStores.some(as => as.storeId === storeId);
}

/**
 * 관리자가 특정 권한을 가지고 있는지 확인
 */
export async function hasPermission(
  adminUid: string,
  storeId: string,
  permission: StorePermission
): Promise<boolean> {
  const adminStores = await getAdminStores(adminUid);
  const adminStore = adminStores.find(as => as.storeId === storeId);
  
  if (!adminStore) return false;
  
  // owner는 모든 권한 보유
  if (adminStore.role === 'owner') return true;
  
  return adminStore.permissions.includes(permission);
}

/**
 * 관리자를 상점에 추가
 */
export async function addAdminToStore(
  adminUid: string,
  storeId: string,
  role: 'owner' | 'manager' | 'staff',
  permissions: StorePermission[]
): Promise<string> {
  const adminStoreData = {
    adminUid,
    storeId,
    role,
    permissions,
    createdAt: new Date(),
  };
  
  const docRef = await addDoc(collection(db, 'adminStores'), adminStoreData);
  return docRef.id;
}

/**
 * 상점에서 관리자 제거
 */
export async function removeAdminFromStore(adminStoreId: string): Promise<void> {
  await deleteDoc(doc(db, 'adminStores', adminStoreId));
}

/**
 * 기본 권한 세트
 */
export const DEFAULT_PERMISSIONS: Record<string, StorePermission[]> = {
  owner: [
    'manage_menus',
    'manage_orders',
    'manage_coupons',
    'manage_reviews',
    'manage_notices',
    'manage_events',
    'manage_store_settings',
    'view_analytics',
  ],
  manager: [
    'manage_menus',
    'manage_orders',
    'manage_coupons',
    'manage_reviews',
    'view_analytics',
  ],
  staff: [
    'manage_orders',
    'view_analytics',
  ],
};
```

---

## File: src\utils\formatDate.ts

```typescript
/**
 * 날짜 포맷 유틸리티
 */

/**
 * Firestore Timestamp 또는 Date를 "YYYY-MM-DD HH:mm:ss" 형식으로 변환
 */
export function formatDate(date: Date | { toDate?: () => Date }): string {
  const d = date instanceof Date ? date : date.toDate?.() || new Date();
  
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  const hours = String(d.getHours()).padStart(2, '0');
  const minutes = String(d.getMinutes()).padStart(2, '0');
  const seconds = String(d.getSeconds()).padStart(2, '0');
  
  return `${year}-${month}-${day} ${hours}:${minutes}:${seconds}`;
}

/**
 * "MM/DD HH:mm" 형식으로 변환
 */
export function formatDateShort(date: Date | { toDate?: () => Date }): string {
  const d = date instanceof Date ? date : date.toDate?.() || new Date();
  
  const month = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  const hours = String(d.getHours()).padStart(2, '0');
  const minutes = String(d.getMinutes()).padStart(2, '0');
  
  return `${month}/${day} ${hours}:${minutes}`;
}

/**
 * 상대적 시간 표시 ("방금", "5분 전", "1시간 전", "어제", "MM/DD")
 */
export function formatDateRelative(date: Date | { toDate?: () => Date }): string {
  const d = date instanceof Date ? date : date.toDate?.() || new Date();
  const now = new Date();
  const diff = now.getTime() - d.getTime();
  
  const seconds = Math.floor(diff / 1000);
  const minutes = Math.floor(seconds / 60);
  const hours = Math.floor(minutes / 60);
  const days = Math.floor(hours / 24);
  
  if (seconds < 60) return '방금';
  if (minutes < 60) return `${minutes}분 전`;
  if (hours < 24) return `${hours}시간 전`;
  if (days === 1) return '어제';
  if (days < 7) return `${days}일 전`;
  
  const month = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${month}/${day}`;
}

/**
 * 날짜를 "YYYY년 MM월 DD일" 형식으로 변환
 */
export function formatDateKorean(date: Date | { toDate?: () => Date }): string {
  const d = date instanceof Date ? date : date.toDate?.() || new Date();
  
  const year = d.getFullYear();
  const month = d.getMonth() + 1;
  const day = d.getDate();
  
  return `${year}년 ${month}월 ${day}일`;
}

export default {
  formatDate,
  formatDateShort,
  formatDateRelative,
  formatDateKorean,
};

```

---

## File: src\utils\labels.ts

```typescript
/**
 * 라벨 및 상수 관리
 */

export const ORDER_STATUS_LABELS = {
  '접수': '주문 접수',
  '조리중': '조리 중',
  '배달중': '배달 중',
  '완료': '배달 완료',
  '취소': '주문 취소',
} as const;

export const PAYMENT_TYPE_LABELS = {
  '앱결제': '앱 결제',
  '만나서카드': '만나서 카드 결제',
  '만나서현금': '만나서 현금 결제',
  '방문시결제': '방문 시 결제',
} as const;

export const CATEGORY_LABELS = [
  '인기메뉴',
  '추천메뉴',
  '기본메뉴',
  '사이드메뉴',
  '음료',
  '주류',
] as const;

export const NOTICE_CATEGORIES = [
  '공지',
  '이벤트',
  '점검',
  '할인',
] as const;

export const COUPON_TYPE_LABELS = {
  'percentage': '할인율',
  'fixed': '할인 금액',
} as const;

export default {
  ORDER_STATUS_LABELS,
  PAYMENT_TYPE_LABELS,
  CATEGORY_LABELS,
  NOTICE_CATEGORIES,
  COUPON_TYPE_LABELS,
};

```

---

