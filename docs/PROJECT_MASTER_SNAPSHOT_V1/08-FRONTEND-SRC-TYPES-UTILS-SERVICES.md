# 프로젝트 마스터 스냅샷 v1.0.0 - 프론트엔드 Types, Utils, Services

**생성일**: 2025-12-10  
**목적**: 프론트엔드 타입 정의, 유틸리티, 서비스 레이어 원본 보관

---

## 1. Types

### src/types/menu.ts

```typescript
export interface MenuOption {
  id: string;
  name: string;
  price: number;
  quantity?: number; // 옵션1용: 수량이 있는 옵션
}

export interface Menu {
  id: string;
  name: string;
  price: number;
  category: string[];
  description: string;
  imageUrl?: string;
  options?: MenuOption[];
  soldout: boolean;
  createdAt: Date;
}

export const CATEGORIES = [
  '인기메뉴',
  '추천메뉴',
  '기본메뉴',
  '사이드메뉴',
  '음료',
  '주류',
] as const;

export type Category = typeof CATEGORIES[number];
```

### src/types/order.ts

```typescript
export interface OrderItem {
  menuId: string;
  name: string;
  price: number;
  quantity: number;
  options?: { name: string; price: number; quantity?: number }[];
  imageUrl?: string;
}

export interface Order {
  id: string;
  userId: string;
  items: OrderItem[];
  totalPrice: number;
  discountAmount?: number;
  couponId?: string;
  couponName?: string;
  status: OrderStatus;
  address: string;
  phone: string;
  memo?: string;
  paymentType: PaymentType;
  // 결제 관련 필드 추가
  paymentStatus?: '결제대기' | '결제완료' | '결제실패';
  payment?: {
    pg: string;
    tid?: string;
    amount?: number;
    paidAt?: any;
    error?: string;
    code?: string;
  };
  createdAt: Date;
  updatedAt?: Date;
  reviewed?: boolean;
  reviewRating?: number;
  orderType?: '배달주문' | '포장주문'; // 주문 타입 추가
}

export type OrderStatus = '결제대기' | '결제실패' | '접수' | '접수완료' | '조리중' | '조리완료' | '배달중' | '포장완료' | '완료' | '취소';
export type PaymentType = '앱결제' | '만나서카드' | '만나서현금' | '방문시결제';

export const ORDER_STATUS_LABELS: Record<OrderStatus, string> = {
  '결제대기': '결제 대기',
  '결제실패': '결제 실패',
  '접수': '주문 접수',
  '접수완료': '접수 완료',
  '조리중': '조리 중',
  '조리완료': '조리 완료',
  '배달중': '배달 중',
  '포장완료': '포장 완료',
  '완료': '배달 완료',
  '취소': '주문 취소',
};

export const ORDER_STATUS_COLORS: Record<OrderStatus, { bg: string; text: string }> = {
  '결제대기': { bg: 'bg-yellow-100', text: 'text-yellow-700' },
  '결제실패': { bg: 'bg-red-100', text: 'text-red-700' },
  '접수': { bg: 'bg-blue-100', text: 'text-blue-700' },
  '접수완료': { bg: 'bg-indigo-100', text: 'text-indigo-700' },
  '조리중': { bg: 'bg-orange-100', text: 'text-orange-700' },
  '조리완료': { bg: 'bg-amber-100', text: 'text-amber-800' },
  '배달중': { bg: 'bg-purple-100', text: 'text-purple-700' },
  '포장완료': { bg: 'bg-emerald-100', text: 'text-emerald-700' },
  '완료': { bg: 'bg-green-100', text: 'text-green-700' },
  '취소': { bg: 'bg-gray-100', text: 'text-gray-700' },
};

export const PAYMENT_TYPE_LABELS: Record<PaymentType, string> = {
  '앱결제': '앱 결제',
  '만나서카드': '만나서 카드 결제',
  '만나서현금': '만나서 현금 결제',
  '방문시결제': '방문 시 결제',
};
```

### src/types/store.ts

```typescript
/**
 * 상점(Store) 타입 정의
 * 단일 레스토랑 앱을 위한 단순화된 구조
 */

export interface Store {
  id: string; // 단일 문서 ID (예: 'store')
  name: string;
  description: string;

  // 연락처 정보
  phone: string;
  email: string;
  address: string;

  // 브랜딩
  logoUrl?: string;
  bannerUrl?: string;
  primaryColor?: string; // 메인 테마 색상

  // 운영 정보
  businessHours?: BusinessHours;
  deliveryFee: number;
  minOrderAmount: number;

  // 설정
  settings: StoreSettings;

  // 메타데이터
  createdAt: any; // Firestore Timestamp
  updatedAt: any; // Firestore Timestamp
}

export interface BusinessHours {
  monday?: DayHours;
  tuesday?: DayHours;
  wednesday?: DayHours;
  thursday?: DayHours;
  friday?: DayHours;
  saturday?: DayHours;
  sunday?: DayHours;
}

export interface DayHours {
  open: string; // "09:00"
  close: string; // "22:00"
  closed: boolean; // 휴무일 여부
}

export interface StoreSettings {
  // 주문 설정
  autoAcceptOrders: boolean; // 자동 주문 접수
  estimatedDeliveryTime: number; // 예상 배달 시간 (분)

  // 결제 설정
  paymentMethods: PaymentMethod[];

  // 알림 설정
  notificationEmail?: string;
  notificationPhone?: string;

  // 기능 활성화
  enableReviews: boolean;
  enableCoupons: boolean;
  enableNotices: boolean;
  enableEvents: boolean;
}

export type PaymentMethod = '앱결제' | '만나서카드' | '만나서현금' | '방문시결제';

/**
 * 상점 설정 폼 데이터
 */
export interface StoreFormData {
  name: string;
  description: string;
  phone: string;
  email: string;
  address: string;
  deliveryFee: number;
  minOrderAmount: number;
  logoUrl?: string;
  bannerUrl?: string;
  businessHours?: BusinessHours;
  settings?: StoreSettings;
}
```

### src/types/coupon.ts

```typescript
export interface Coupon {
  id: string;
  code: string;
  name: string;
  discountType: 'percentage' | 'fixed';
  discountValue: number;
  minOrderAmount: number;
  maxDiscountAmount?: number;
  validFrom: Date;
  validUntil: Date;
  isActive: boolean;
  createdAt: Date;
  // 특정 회원에게만 발급된 쿠폰인 경우
  assignedUserId?: string;
  assignedUserName?: string;
  assignedUserPhone?: string;
  // 사용 여부 (1회만 사용 가능)
  isUsed: boolean;
  usedAt?: Date;
  usedByUserIds?: string[]; // 이 쿠폰을 사용한 사용자 ID 목록
}

export const DISCOUNT_TYPE_LABELS = {
  percentage: '퍼센트 할인',
  fixed: '금액 할인',
};
```

### src/types/review.ts

```typescript
/**
 * 리뷰 타입 정의
 */

export interface Review {
  id: string;
  orderId: string;
  userId: string;
  userDisplayName: string;
  rating: number; // 1-5
  comment: string;
  images?: string[];
  createdAt: Date;
  updatedAt?: Date;
}

export interface CreateReviewData extends Omit<Review, 'id' | 'createdAt' | 'updatedAt'> { }

export interface UpdateReviewData extends Partial<Omit<Review, 'id' | 'orderId' | 'userId' | 'createdAt'>> { }
```

### src/types/notice.ts

```typescript
export interface Notice {
  id: string;
  title: string;
  content: string;
  category: '공지' | '이벤트' | '점검' | '할인';
  pinned: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export const NOTICE_CATEGORIES = ['공지', '이벤트', '점검', '할인'] as const;
export type NoticeCategory = typeof NOTICE_CATEGORIES[number];
```

### src/types/event.ts

```typescript
export interface Event {
  id: string;
  title: string;
  imageUrl: string;
  link: string;
  active: boolean;
  startDate: Date;
  endDate: Date;
  createdAt: Date;
}
```

### src/types/dashboard.ts

```typescript
import { BadgeVariant } from '../components/common/Badge';

export interface StatCardProps {
    label: string;
    value: number | string;
    icon: React.ReactNode;
    color: 'blue' | 'green' | 'orange' | 'purple';
    suffix?: string;
    loading?: boolean;
}

export interface QuickStatProps {
    label: string;
    value: number | string;
    suffix: string;
    color: 'blue' | 'green' | 'red' | 'orange' | 'purple';
}

export function getNoticeCategoryColor(category: string): BadgeVariant {
    switch (category) {
        case '공지': return 'primary';
        case '이벤트': return 'secondary';
        case '점검': return 'danger';
        case '할인': return 'success';
        default: return 'gray';
    }
}
```

### src/types/global.d.ts

```typescript
export { };

declare global {
    interface Window {
        AUTHNICE?: {
            requestPay: (params: NicepayRequestParams) => void;
        };
    }
}

export interface NicepayRequestParams {
    clientId: string;
    method: string;
    orderId: string;
    amount: number;
    goodsName: string;
    returnUrl: string;
    fnError?: (result: any) => void; // 결제 실패 시 콜백
    // 필요한 경우 추가 필드 정의
    buyerName?: string;
    buyerEmail?: string;
    buyerTel?: string;
    mallReserved?: string; // 상점 예비정보
}

export interface NicepaySuccessResult {
    resultCode: string;
    resultMsg: string;
    authResultCode: string;
    authResultMsg: string;
    tid: string;
    clientId: string;
    orderId: string;
    amount: number;
    mallReserved?: string;
    authToken: string; // 승인 요청 시 필요
    signature: string; // 위변조 검증
}
```

---

## 2. Utils

### src/utils/formatDate.ts

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

### src/utils/labels.ts

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

### src/utils/orderUtils.ts

```typescript
import { Order, OrderStatus } from '../types/order';

// 헬퍼 함수: 다음 주문 상태 계산
export function getNextStatus(order: Order): OrderStatus | null {
    const currentStatus = order.status;
    const isPickup = order.orderType === '포장주문';

    // 상태 흐름 정의
    const deliveryFlow: OrderStatus[] = ['접수', '접수완료', '조리중', '배달중', '완료'];
    const pickupFlow: OrderStatus[] = ['접수', '접수완료', '조리중', '조리완료', '포장완료'];

    const statusFlow = isPickup ? pickupFlow : deliveryFlow;
    const currentIndex = statusFlow.indexOf(currentStatus as OrderStatus);

    if (currentIndex >= 0 && currentIndex < statusFlow.length - 1) {
        return statusFlow[currentIndex + 1];
    }
    return null;
}
```

---

## 3. Services

### src/services/menuService.ts

```typescript
import {
  collection,
  addDoc,
  updateDoc,
  deleteDoc,
  doc,
  serverTimestamp,
  query,
  where,
  orderBy
} from 'firebase/firestore';
import { db } from '../lib/firebase';
import { Menu } from '../types/menu';

// 컬렉션 참조 헬퍼 (stores/{storeId}/menus)
const getMenuCollection = (storeId: string) => collection(db, 'stores', storeId, 'menus');

// 메뉴 추가
export async function createMenu(storeId: string, menuData: Omit<Menu, 'id' | 'createdAt'>) {
  try {
    const docRef = await addDoc(getMenuCollection(storeId), {
      ...menuData,
      createdAt: serverTimestamp(),
    });
    return docRef.id;
  } catch (error) {
    console.error('메뉴 추가 실패:', error);
    throw error;
  }
}

// 메뉴 수정
export async function updateMenu(storeId: string, menuId: string, menuData: Partial<Menu>) {
  try {
    const menuRef = doc(db, 'stores', storeId, 'menus', menuId);
    await updateDoc(menuRef, {
      ...menuData,
      updatedAt: serverTimestamp(),
    });
  } catch (error) {
    console.error('메뉴 수정 실패:', error);
    throw error;
  }
}

// 메뉴 삭제
export async function deleteMenu(storeId: string, menuId: string) {
  try {
    const menuRef = doc(db, 'stores', storeId, 'menus', menuId);
    await deleteDoc(menuRef);
  } catch (error) {
    console.error('메뉴 삭제 실패:', error);
    throw error;
  }
}

// 품절 상태 변경
export async function toggleMenuSoldout(storeId: string, menuId: string, soldout: boolean) {
  try {
    const menuRef = doc(db, 'stores', storeId, 'menus', menuId);
    await updateDoc(menuRef, {
      soldout,
      updatedAt: serverTimestamp(),
    });
  } catch (error) {
    console.error('품절 상태 변경 실패:', error);
    throw error;
  }
}

// Query 헬퍼 함수들
export function getAllMenusQuery(storeId: string) {
  return query(
    getMenuCollection(storeId),
    orderBy('createdAt', 'desc')
  );
}

export function getMenusByCategoryQuery(storeId: string, category: string) {
  return query(
    getMenuCollection(storeId),
    where('category', 'array-contains', category),
    orderBy('createdAt', 'desc')
  );
}
```

### src/services/orderService.ts

```typescript
import {
  collection,
  addDoc,
  updateDoc,
  doc,
  serverTimestamp,
  query,
  where,
  orderBy
} from 'firebase/firestore';
import { db } from '../lib/firebase';
import { Order, OrderStatus } from '../types/order';

// 컬렉션 참조 헬퍼 (stores/{storeId}/orders)
const getOrderCollection = (storeId: string) => collection(db, 'stores', storeId, 'orders');

// 주문 생성
export async function createOrder(storeId: string, orderData: Omit<Order, 'id' | 'createdAt' | 'updatedAt'>) {
  try {
    const docRef = await addDoc(getOrderCollection(storeId), {
      ...orderData,
      status: orderData.status || '접수', // status가 있으면 사용, 없으면 '접수'
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
    });
    return docRef.id;
  } catch (error) {
    console.error('주문 생성 실패:', error);
    throw error;
  }
}

// 주문 상태 변경
export async function updateOrderStatus(storeId: string, orderId: string, status: OrderStatus) {
  try {
    const orderRef = doc(db, 'stores', storeId, 'orders', orderId);
    await updateDoc(orderRef, {
      status,
      updatedAt: serverTimestamp(),
    });
  } catch (error) {
    console.error('주문 상태 변경 실패:', error);
    throw error;
  }
}

// 주문 취소
export async function cancelOrder(storeId: string, orderId: string) {
  try {
    const orderRef = doc(db, 'stores', storeId, 'orders', orderId);
    await updateDoc(orderRef, {
      status: '취소' as OrderStatus,
      updatedAt: serverTimestamp(),
    });
  } catch (error) {
    console.error('주문 취소 실패:', error);
    throw error;
  }
}

// 주문 삭제 (Hard Delete)
export async function deleteOrder(storeId: string, orderId: string) {
  try {
    const { deleteDoc } = await import('firebase/firestore');
    const orderRef = doc(db, 'stores', storeId, 'orders', orderId);
    await deleteDoc(orderRef);
  } catch (error) {
    console.error('주문 삭제 실패:', error);
    throw error;
  }
}

// Query 헬퍼 함수들
export function getUserOrdersQuery(storeId: string, userId: string) {
  return query(
    getOrderCollection(storeId),
    where('userId', '==', userId),
    orderBy('createdAt', 'desc')
  );
}

export function getAllOrdersQuery(storeId: string) {
  return query(
    getOrderCollection(storeId),
    orderBy('createdAt', 'desc')
  );
}

export function getOrdersByStatusQuery(storeId: string, status: OrderStatus) {
  return query(
    getOrderCollection(storeId),
    where('status', '==', status),
    orderBy('createdAt', 'desc')
  );
}
```

### src/services/couponService.ts

```typescript
import {
  collection,
  addDoc,
  updateDoc,
  deleteDoc,
  doc,
  serverTimestamp,
  query,
  where,
  orderBy,
  increment,
  arrayUnion
} from 'firebase/firestore';
import { db } from '../lib/firebase';
import { Coupon } from '../types/coupon';

// 컬렉션 참조 헬퍼 (stores/{storeId}/coupons)
const getCouponCollection = (storeId: string) => collection(db, 'stores', storeId, 'coupons');

// 쿠폰 생성
export async function createCoupon(storeId: string, couponData: Omit<Coupon, 'id' | 'createdAt' | 'usedCount'>) {
  try {
    const docRef = await addDoc(getCouponCollection(storeId), {
      ...couponData,
      usedCount: 0,
      createdAt: serverTimestamp(),
    });
    return docRef.id;
  } catch (error) {
    console.error('쿠폰 생성 실패:', error);
    throw error;
  }
}

// 쿠폰 수정
export async function updateCoupon(storeId: string, couponId: string, couponData: Partial<Coupon>) {
  try {
    const couponRef = doc(db, 'stores', storeId, 'coupons', couponId);
    await updateDoc(couponRef, {
      ...couponData,
      updatedAt: serverTimestamp(),
    });
  } catch (error) {
    console.error('쿠폰 수정 실패:', error);
    throw error;
  }
}

// 쿠폰 삭제
export async function deleteCoupon(storeId: string, couponId: string) {
  try {
    const couponRef = doc(db, 'stores', storeId, 'coupons', couponId);
    await deleteDoc(couponRef);
  } catch (error) {
    console.error('쿠폰 삭제 실패:', error);
    throw error;
  }
}

// 쿠폰 활성화/비활성화
export async function toggleCouponActive(storeId: string, couponId: string, isActive: boolean) {
  try {
    const couponRef = doc(db, 'stores', storeId, 'coupons', couponId);
    await updateDoc(couponRef, {
      isActive,
      updatedAt: serverTimestamp(),
    });
  } catch (error) {
    console.error('쿠폰 상태 변경 실패:', error);
    throw error;
  }
}

// 쿠폰 사용
export async function useCoupon(storeId: string, couponId: string, userId: string) {
  try {
    const couponRef = doc(db, 'stores', storeId, 'coupons', couponId);
    await updateDoc(couponRef, {
      usedCount: increment(1),
      usedByUserIds: arrayUnion(userId)
    });
  } catch (error) {
    console.error('쿠폰 사용 처리 실패:', error);
    throw error;
  }
}

// Query 헬퍼 함수들
export function getAllCouponsQuery(storeId: string) {
  return query(
    getCouponCollection(storeId),
    orderBy('createdAt', 'desc')
  );
}

export function getActiveCouponsQuery(storeId: string) {
  return query(
    getCouponCollection(storeId),
    where('isActive', '==', true),
    orderBy('createdAt', 'desc')
  );
}
```

### src/services/reviewService.ts

```typescript
import {
  collection,
  addDoc,
  updateDoc,
  deleteDoc,
  doc,
  query,
  where,
  orderBy,
  getDocs,
  serverTimestamp,
} from 'firebase/firestore';
import { db } from '../lib/firebase';
import { Review, CreateReviewData, UpdateReviewData } from '../types/review';

// 컬렉션 참조 헬퍼
const getReviewCollection = (storeId: string) => collection(db, 'stores', storeId, 'reviews');

/**
 * 리뷰 생성
 */
export async function createReview(
  storeId: string,
  reviewData: CreateReviewData
): Promise<string> {
  try {
    // 1. 리뷰 생성
    const docRef = await addDoc(getReviewCollection(storeId), {
      ...reviewData,
      createdAt: serverTimestamp(),
    });

    // 2. 주문 문서에 리뷰 정보 미러링 (stores/{storeId}/orders/{orderId})
    const orderRef = doc(db, 'stores', storeId, 'orders', reviewData.orderId);
    await updateDoc(orderRef, {
      reviewed: true,
      reviewText: reviewData.comment,
      reviewRating: reviewData.rating,
      reviewedAt: serverTimestamp(),
    });

    return docRef.id;
  } catch (error) {
    console.error('리뷰 생성 실패:', error);
    throw error;
  }
}

/**
 * 리뷰 수정
 */
export async function updateReview(
  storeId: string,
  reviewId: string,
  reviewData: UpdateReviewData
): Promise<void> {
  try {
    const reviewRef = doc(db, 'stores', storeId, 'reviews', reviewId);
    await updateDoc(reviewRef, {
      ...reviewData,
      updatedAt: serverTimestamp(),
    });
  } catch (error) {
    console.error('리뷰 수정 실패:', error);
    throw error;
  }
}

/**
 * 리뷰 삭제
 */
export async function deleteReview(
  storeId: string,
  reviewId: string,
  orderId: string
): Promise<void> {
  try {
    // 1. 리뷰 삭제
    const reviewRef = doc(db, 'stores', storeId, 'reviews', reviewId);
    await deleteDoc(reviewRef);

    // 2. 주문 문서 리뷰 필드 초기화 (주문이 존재할 경우에만)
    try {
      const orderRef = doc(db, 'stores', storeId, 'orders', orderId);
      await updateDoc(orderRef, {
        reviewed: false,
        reviewText: null,
        reviewRating: null,
        reviewedAt: null,
      });
    } catch (updateError: any) {
      // 주문이 이미 삭제된 경우(No document to update)는 무시
      if (updateError?.code === 'not-found' || updateError?.message?.includes('No document to update')) {
        console.warn('주문 문서를 찾을 수 없어 리뷰 상태를 업데이트하지 못했습니다 (주문 삭제됨).', orderId);
      } else {
        // 다른 에러는 로깅하되, 리뷰 삭제 자체는 성공했으므로 상위로 전파하지 않음 (선택 사항)
        // 상황에 따라 판단해야 하지만, 리뷰 삭제가 메인 의도이므로 경고만 남기겠습니다.
        console.error('주문 문서 업데이트 중 오류 발생:', updateError);
      }
    }
  } catch (error) {
    console.error('리뷰 삭제 실패:', error);
    throw error;
  }
}

/**
 * 특정 주문의 리뷰 조회
 */
export async function getReviewByOrder(
  storeId: string,
  orderId: string,
  userId: string
): Promise<Review | null> {
  try {
    const q = query(
      getReviewCollection(storeId),
      where('orderId', '==', orderId),
      where('userId', '==', userId)
    );

    const snapshot = await getDocs(q);

    if (snapshot.empty) {
      return null;
    }

    const doc = snapshot.docs[0];
    return {
      id: doc.id,
      ...doc.data(),
    } as Review;
  } catch (error) {
    console.error('리뷰 조회 실패:', error);
    throw error;
  }
}

/**
 * 모든 리뷰 쿼리 (최신순)
 */
export function getAllReviewsQuery(storeId: string) {
  return query(
    getReviewCollection(storeId),
    orderBy('createdAt', 'desc')
  );
}

/**
 * 특정 평점 이상 리뷰 쿼리
 */
export function getReviewsByRatingQuery(storeId: string, minRating: number) {
  return query(
    getReviewCollection(storeId),
    where('rating', '>=', minRating),
    orderBy('rating', 'desc'),
    orderBy('createdAt', 'desc')
  );
}
```

### src/services/userService.ts

```typescript
import { collection, query, where, getDocs, limit, orderBy } from 'firebase/firestore';
import { db } from '../lib/firebase';
import { User } from '../types/user';

// User 타입 정의 (기존 types/user.ts가 없다면 여기에 정의하거나 types 폴더에 추가해야 함)
// 일단 간단한 인터페이스 사용
export interface UserProfile {
    id: string;
    name: string;
    phone: string;
    email: string;
    createdAt: any;
}

const COLLECTION_NAME = 'users';

export async function searchUsers(keyword: string): Promise<UserProfile[]> {
    try {
        const usersRef = collection(db, COLLECTION_NAME);
        let q;

        // 전화번호로 검색 (정확히 일치하거나 시작하는 경우)
        if (/^[0-9-]+$/.test(keyword)) {
            q = query(
                usersRef,
                where('phone', '>=', keyword),
                where('phone', '<=', keyword + '\uf8ff'),
                limit(5)
            );
        } else {
            // 이름으로 검색
            q = query(
                usersRef,
                where('displayName', '>=', keyword),
                where('displayName', '<=', keyword + '\uf8ff'),
                limit(5)
            );
        }

        const snapshot = await getDocs(q);
        const users: UserProfile[] = [];

        snapshot.forEach((doc) => {
            const data = doc.data();
            users.push({
                id: doc.id,
                name: data.displayName || data.name || '이름 없음',
                phone: data.phone || '',
                email: data.email || '',
                createdAt: data.createdAt,
            });
        });

        return users;
    } catch (error) {
        console.error('사용자 검색 실패:', error);
        return [];
    }
}

// 전체 사용자 목록 가져오기 (최근 가입순 20명)
export async function getRecentUsers(): Promise<UserProfile[]> {
    try {
        const q = query(
            collection(db, COLLECTION_NAME),
            orderBy('createdAt', 'desc'),
            limit(20)
        );

        const snapshot = await getDocs(q);
        return snapshot.docs.map(doc => ({
            id: doc.id,
            name: doc.data().name || '이름 없음',
            phone: doc.data().phone || '',
            email: doc.data().email || '',
            createdAt: doc.data().createdAt,
        })) as UserProfile[];
    } catch (error) {
        console.error('사용자 목록 로드 실패:', error);
        return [];
    }
}
```

### src/services/noticeService.ts

```typescript
import {
  collection,
  addDoc,
  updateDoc,
  deleteDoc,
  doc,
  query,
  where,
  orderBy,
  serverTimestamp,
} from 'firebase/firestore';
import { db } from '../lib/firebase';
import { Notice, NoticeCategory } from '../types/notice';

// 컬렉션 참조 헬퍼
const getNoticeCollection = (storeId: string) => collection(db, 'stores', storeId, 'notices');

/**
 * 공지사항 생성
 */
export async function createNotice(
  storeId: string,
  noticeData: Omit<Notice, 'id' | 'createdAt' | 'updatedAt'>
): Promise<string> {
  try {
    const docRef = await addDoc(getNoticeCollection(storeId), {
      ...noticeData,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
    });
    return docRef.id;
  } catch (error) {
    console.error('공지사항 생성 실패:', error);
    throw error;
  }
}

/**
 * 공지사항 수정
 */
export async function updateNotice(
  storeId: string,
  noticeId: string,
  noticeData: Partial<Omit<Notice, 'id' | 'createdAt'>>
): Promise<void> {
  try {
    const noticeRef = doc(db, 'stores', storeId, 'notices', noticeId);
    await updateDoc(noticeRef, {
      ...noticeData,
      updatedAt: serverTimestamp(),
    });
  } catch (error) {
    console.error('공지사항 수정 실패:', error);
    throw error;
  }
}

/**
 * 공지사항 삭제
 */
export async function deleteNotice(
  storeId: string,
  noticeId: string
): Promise<void> {
  try {
    const noticeRef = doc(db, 'stores', storeId, 'notices', noticeId);
    await deleteDoc(noticeRef);
  } catch (error) {
    console.error('공지사항 삭제 실패:', error);
    throw error;
  }
}

/**
 * 공지사항 고정 토글
 */
export async function toggleNoticePinned(
  storeId: string,
  noticeId: string,
  pinned: boolean
): Promise<void> {
  try {
    const noticeRef = doc(db, 'stores', storeId, 'notices', noticeId);
    await updateDoc(noticeRef, {
      pinned,
      updatedAt: serverTimestamp(),
    });
  } catch (error) {
    console.error('공지사항 고정 상태 변경 실패:', error);
    throw error;
  }
}

/**
 * 모든 공지사항 쿼리 (고정 공지 우선, 최신순)
 */
export function getAllNoticesQuery(storeId: string) {
  return query(
    getNoticeCollection(storeId),
    orderBy('pinned', 'desc'),
    orderBy('createdAt', 'desc')
  );
}

/**
 * 카테고리별 공지사항 쿼리
 */
export function getNoticesByCategoryQuery(storeId: string, category: NoticeCategory) {
  return query(
    getNoticeCollection(storeId),
    where('category', '==', category),
    orderBy('pinned', 'desc'),
    orderBy('createdAt', 'desc')
  );
}

/**
 * 고정된 공지사항만 조회
 */
export function getPinnedNoticesQuery(storeId: string) {
  return query(
    getNoticeCollection(storeId),
    where('pinned', '==', true),
    orderBy('createdAt', 'desc')
  );
}
```

### src/services/eventService.ts

```typescript
import {
  collection,
  addDoc,
  updateDoc,
  deleteDoc,
  doc,
  query,
  where,
  orderBy,
  serverTimestamp,
  Timestamp,
} from 'firebase/firestore';
import { db } from '../lib/firebase';
import { Event } from '../types/event';

const getEventCollection = (storeId: string) => collection(db, 'stores', storeId, 'events');

/**
 * 이벤트 생성
 */
export async function createEvent(
  storeId: string,
  eventData: Omit<Event, 'id' | 'createdAt'>
): Promise<string> {
  try {
    const docRef = await addDoc(getEventCollection(storeId), {
      title: eventData.title,
      imageUrl: eventData.imageUrl,
      link: eventData.link,
      active: eventData.active,
      startDate: eventData.startDate instanceof Timestamp ? eventData.startDate : Timestamp.fromDate(new Date(eventData.startDate)),
      endDate: eventData.endDate instanceof Timestamp ? eventData.endDate : Timestamp.fromDate(new Date(eventData.endDate)),
      createdAt: serverTimestamp(),
    });
    return docRef.id;
  } catch (error) {
    console.error('이벤트 생성 실패:', error);
    throw error;
  }
}

/**
 * 이벤트 수정
 */
export async function updateEvent(
  storeId: string,
  eventId: string,
  eventData: Partial<Omit<Event, 'id' | 'createdAt'>>
): Promise<void> {
  try {
    const eventRef = doc(db, 'stores', storeId, 'events', eventId);
    const updateData: any = {};

    if (eventData.title !== undefined) updateData.title = eventData.title;
    if (eventData.imageUrl !== undefined) updateData.imageUrl = eventData.imageUrl;
    if (eventData.link !== undefined) updateData.link = eventData.link;
    if (eventData.active !== undefined) updateData.active = eventData.active;
    if (eventData.startDate !== undefined) {
      const start = eventData.startDate as any;
      updateData.startDate = start instanceof Timestamp ? start : Timestamp.fromDate(new Date(start));
    }
    if (eventData.endDate !== undefined) {
      const end = eventData.endDate as any;
      updateData.endDate = end instanceof Timestamp ? end : Timestamp.fromDate(new Date(end));
    }

    await updateDoc(eventRef, updateData);
  } catch (error) {
    console.error('이벤트 수정 실패:', error);
    throw error;
  }
}

/**
 * 이벤트 삭제
 */
export async function deleteEvent(
  storeId: string,
  eventId: string
): Promise<void> {
  try {
    const eventRef = doc(db, 'stores', storeId, 'events', eventId);
    await deleteDoc(eventRef);
  } catch (error) {
    console.error('이벤트 삭제 실패:', error);
    throw error;
  }
}

/**
 * 이벤트 활성화 토글
 */
export async function toggleEventActive(
  storeId: string,
  eventId: string,
  active: boolean
): Promise<void> {
  try {
    const eventRef = doc(db, 'stores', storeId, 'events', eventId);
    await updateDoc(eventRef, { active });
  } catch (error) {
    console.error('이벤트 활성화 상태 변경 실패:', error);
    throw error;
  }
}

/**
 * 모든 이벤트 쿼리 (생성일 내림차순)
 */
export function getAllEventsQuery(storeId: string) {
  return query(
    getEventCollection(storeId),
    orderBy('createdAt', 'desc')
  );
}

/**
 * 활성화된 이벤트만 조회
 */
export function getActiveEventsQuery(storeId: string) {
  return query(
    getEventCollection(storeId),
    where('active', '==', true),
    orderBy('startDate', 'asc')
  );
}
```

### src/services/storageService.ts

```typescript
import {
  ref,
  uploadBytes,
  getDownloadURL,
  deleteObject,
  uploadBytesResumable,
  UploadTask
} from 'firebase/storage';
import { storage } from '../lib/firebase';

// 이미지 업로드
export async function uploadImage(
  file: File,
  path: string,
  onProgress?: (progress: number) => void
): Promise<string> {
  try {
    const storageRef = ref(storage, path);

    if (onProgress) {
      // 진행상황을 추적하려면 uploadBytesResumable 사용
      const uploadTask = uploadBytesResumable(storageRef, file);

      return new Promise((resolve, reject) => {
        uploadTask.on(
          'state_changed',
          (snapshot) => {
            const progress = (snapshot.bytesTransferred / snapshot.totalBytes) * 100;
            onProgress(progress);
          },
          (error) => {
            console.error('이미지 업로드 실패:', error);
            reject(error);
          },
          async () => {
            const downloadURL = await getDownloadURL(uploadTask.snapshot.ref);
            resolve(downloadURL);
          }
        );
      });
    } else {
      // 간단한 업로드
      const snapshot = await uploadBytes(storageRef, file);
      const downloadURL = await getDownloadURL(snapshot.ref);
      return downloadURL;
    }
  } catch (error) {
    console.error('이미지 업로드 실패:', error);
    throw error;
  }
}

// 메뉴 이미지 업로드
export async function uploadMenuImage(
  file: File,
  menuId: string,
  onProgress?: (progress: number) => void
): Promise<string> {
  const path = `menus/${menuId}/${Date.now()}_${file.name}`;
  return uploadImage(file, path, onProgress);
}

// 프로필 이미지 업로드
export async function uploadProfileImage(
  file: File,
  userId: string,
  onProgress?: (progress: number) => void
): Promise<string> {
  const path = `profiles/${userId}/${Date.now()}_${file.name}`;
  return uploadImage(file, path, onProgress);
}

// 이미지 삭제
export async function deleteImage(imageUrl: string): Promise<void> {
  try {
    // URL에서 파일 경로 추출
    const imageRef = ref(storage, imageUrl);
    await deleteObject(imageRef);
  } catch (error) {
    console.error('이미지 삭제 실패:', error);
    throw error;
  }
}

// 파일 유효성 검사
export function validateImageFile(file: File): { valid: boolean; error?: string } {
  const maxSize = 5 * 1024 * 1024; // 5MB
  const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'];

  if (!allowedTypes.includes(file.type)) {
    return {
      valid: false,
      error: '지원되는 이미지 형식: JPG, PNG, WebP',
    };
  }

  if (file.size > maxSize) {
    return {
      valid: false,
      error: '이미지 크기는 5MB 이하여야 합니다',
    };
  }

  return { valid: true };
}

// 이미지 리사이즈 (선택적)
export async function resizeImage(
  file: File,
  maxWidth: number = 800,
  maxHeight: number = 800
): Promise<Blob> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);

    reader.onload = (event) => {
      const img = new Image();
      img.src = event.target?.result as string;

      img.onload = () => {
        const canvas = document.createElement('canvas');
        let width = img.width;
        let height = img.height;

        // 비율 유지하면서 리사이즈
        if (width > height) {
          if (width > maxWidth) {
            height *= maxWidth / width;
            width = maxWidth;
          }
        } else {
          if (height > maxHeight) {
            width *= maxHeight / height;
            height = maxHeight;
          }
        }

        canvas.width = width;
        canvas.height = height;

        const ctx = canvas.getContext('2d');
        ctx?.drawImage(img, 0, 0, width, height);

        canvas.toBlob(
          (blob) => {
            if (blob) {
              resolve(blob);
            } else {
              reject(new Error('이미지 리사이즈 실패'));
            }
          },
          file.type,
          0.9
        );
      };

      img.onerror = () => reject(new Error('이미지 로드 실패'));
    };

    reader.onerror = () => reject(new Error('파일 읽기 실패'));
  });
}

// 이벤트 이미지 업로드
export async function uploadEventImage(file: File): Promise<string> {
  const path = `events/${Date.now()}_${file.name}`;
  return uploadImage(file, path);
}

// 상점 이미지 업로드 (로고/배너)
export async function uploadStoreImage(file: File, type: 'logo' | 'banner'): Promise<string> {
  // 경로: store/{type}_{timestamp}_{filename}
  const timestamp = Date.now();
  const path = `store/${type}_${timestamp}_${file.name}`;
  return uploadImage(file, path);
}

// 리뷰 이미지 업로드
export async function uploadReviewImage(file: File): Promise<string> {
  const path = `reviews/${Date.now()}_${file.name}`;
  return uploadImage(file, path);
}
```

---

**다음 문서**: 
- `09-FRONTEND-SRC-COMPONENTS.md`: components (전체)
- `10-FRONTEND-SRC-PAGES.md`: pages (전체)


