# 05-Service-Layer

Generated: 2025-12-10 16:23:01

---

## File: src\services\couponService.test.ts

```typescript
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { validateCoupon } from './couponService';

// Mock dependencies
vi.mock('../lib/firebase', () => ({
    db: {},
}));

describe('couponService', () => {
    beforeEach(() => {
        vi.clearAllMocks();
    });

    describe('validateCoupon', () => {
        it('should return valid if conditions met', () => {
            const coupon = {
                code: 'TEST',
                discountAmount: 1000,
                minOrderAmount: 10000,
                validUntil: { toDate: () => new Date('2099-12-31') }, // Future
                isActive: true,
                usedByUserIds: []
            };

            const result = validateCoupon(coupon as any, 15000, 'user1');
            expect(result.isValid).toBe(true);
        });

        it('should fail if order amount is too low', () => {
            const coupon = {
                code: 'TEST',
                minOrderAmount: 10000,
                validUntil: { toDate: () => new Date('2099-12-31') },
                isActive: true,
                usedByUserIds: []
            };
            // 5000 < 10000
            const result = validateCoupon(coupon as any, 5000, 'user1');
            expect(result.isValid).toBe(false);
            expect(result.reason).toContain('최소 주문 금액');
        });

        it('should fail if expired', () => {
            const coupon = {
                code: 'TEST',
                minOrderAmount: 0,
                validUntil: { toDate: () => new Date('2020-01-01') }, // Past
                isActive: true,
                usedByUserIds: []
            };
            const result = validateCoupon(coupon as any, 10000, 'user1');
            expect(result.isValid).toBe(false);
            expect(result.reason).toContain('유효기간');
        });

        it('should fail if already used by user', () => {
            const coupon = {
                code: 'TEST',
                minOrderAmount: 0,
                validUntil: { toDate: () => new Date('2099-12-31') },
                isActive: true,
                usedByUserIds: ['user1'] // Used
            };
            const result = validateCoupon(coupon as any, 10000, 'user1');
            expect(result.isValid).toBe(false);
            expect(result.reason).toContain('이미 사용');
        });
    });
});

```

---

## File: src\services\couponService.ts

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

---

## File: src\services\eventService.ts

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

---

## File: src\services\menuService.test.ts

```typescript
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { createMenu, updateMenu, deleteMenu, toggleMenuSoldout } from './menuService';
import { collection, addDoc, updateDoc, deleteDoc, doc, serverTimestamp } from 'firebase/firestore';

// Mock dependencies
vi.mock('../lib/firebase', () => ({
    db: {},
}));

vi.mock('firebase/firestore', async () => {
    const actual = await vi.importActual('firebase/firestore');
    return {
        ...actual,
        collection: vi.fn(),
        addDoc: vi.fn(),
        updateDoc: vi.fn(),
        deleteDoc: vi.fn(),
        doc: vi.fn(),
        serverTimestamp: vi.fn(() => 'MOCK_TIMESTAMP'),
        query: vi.fn(),
        where: vi.fn(),
        orderBy: vi.fn(),
    };
});

describe('menuService', () => {
    const mockStoreId = 'store_123';
    const mockMenuId = 'menu_xyz';

    beforeEach(() => {
        vi.clearAllMocks();
    });

    describe('createMenu', () => {
        it('should create menu with timestamp', async () => {
            const mockDocRef = { id: 'new_menu_id' };
            (addDoc as any).mockResolvedValue(mockDocRef);
            (collection as any).mockReturnValue('MOCK_COLLECTION_REF');

            const menuData = {
                name: 'Pho',
                price: 10000,
                category: ['Noodle'], // Correct as string[]
                description: 'Delicious',
                imageUrl: 'http://example.com/img.jpg',
                isBest: true,
                soldout: false,
                options: []
            };

            const result = await createMenu(mockStoreId, menuData);

            expect(collection).toHaveBeenCalledWith(expect.anything(), 'stores', mockStoreId, 'menus');
            expect(addDoc).toHaveBeenCalledWith('MOCK_COLLECTION_REF', {
                ...menuData,
                createdAt: 'MOCK_TIMESTAMP',
            });
            expect(result).toBe('new_menu_id');
        });
    });

    describe('updateMenu', () => {
        it('should update menu fields and timestamp', async () => {
            (doc as any).mockReturnValue('MOCK_DOC_REF');

            await updateMenu(mockStoreId, mockMenuId, { price: 12000 });

            expect(doc).toHaveBeenCalledWith(expect.anything(), 'stores', mockStoreId, 'menus', mockMenuId);
            expect(updateDoc).toHaveBeenCalledWith('MOCK_DOC_REF', {
                price: 12000,
                updatedAt: 'MOCK_TIMESTAMP',
            });
        });
    });

    describe('deleteMenu', () => {
        it('should delete menu document', async () => {
            (doc as any).mockReturnValue('MOCK_DOC_REF');

            await deleteMenu(mockStoreId, mockMenuId);

            expect(deleteDoc).toHaveBeenCalledWith('MOCK_DOC_REF');
        });
    });

    describe('toggleMenuSoldout', () => {
        it('should update soldout status and timestamp', async () => {
            (doc as any).mockReturnValue('MOCK_DOC_REF');

            await toggleMenuSoldout(mockStoreId, mockMenuId, true);

            expect(updateDoc).toHaveBeenCalledWith('MOCK_DOC_REF', {
                soldout: true,
                updatedAt: 'MOCK_TIMESTAMP',
            });
        });
    });
});

```

---

## File: src\services\menuService.ts

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

---

## File: src\services\noticeService.ts

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

---

## File: src\services\orderService.test.ts

```typescript
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { createOrder, updateOrderStatus, cancelOrder, deleteOrder } from './orderService';
import { collection, addDoc, updateDoc, doc, serverTimestamp, deleteDoc } from 'firebase/firestore';

// Mock dependencies
vi.mock('../lib/firebase', () => ({
    db: {},
}));

vi.mock('firebase/firestore', async () => {
    const actual = await vi.importActual('firebase/firestore');
    return {
        ...actual,
        collection: vi.fn(),
        addDoc: vi.fn(),
        updateDoc: vi.fn(),
        deleteDoc: vi.fn(),
        doc: vi.fn(),
        serverTimestamp: vi.fn(() => 'MOCK_TIMESTAMP'),
        query: vi.fn(),
        where: vi.fn(),
        orderBy: vi.fn(),
    };
});

describe('orderService', () => {
    const mockStoreId = 'store_123';
    const mockOrderId = 'order_abc';

    beforeEach(() => {
        vi.clearAllMocks();
    });

    describe('createOrder', () => {
        it('should create an order with default status "접수"', async () => {
            const mockDocRef = { id: 'new_order_id' };
            (addDoc as any).mockResolvedValue(mockDocRef);
            (collection as any).mockReturnValue('MOCK_COLLECTION_REF');

            const orderData = {
                userId: 'user_1',
                items: [],
                totalPrice: 10000,
                paymentType: 'card',
                address: 'Seoul',
                phone: '010-0000-0000'
            };

            const result = await createOrder(mockStoreId, orderData as any);

            expect(collection).toHaveBeenCalledWith(expect.anything(), 'stores', mockStoreId, 'orders');
            expect(addDoc).toHaveBeenCalledWith('MOCK_COLLECTION_REF', expect.objectContaining({
                ...orderData,
                status: '접수',
                createdAt: 'MOCK_TIMESTAMP',
                updatedAt: 'MOCK_TIMESTAMP',
            }));
            expect(result).toBe('new_order_id');
        });

        it('should use provided status if given', async () => {
            const mockDocRef = { id: 'new_order_id' };
            (addDoc as any).mockResolvedValue(mockDocRef);

            const orderData = {
                status: '조리중',
                totalPrice: 10000,
            };

            await createOrder(mockStoreId, orderData as any);

            expect(addDoc).toHaveBeenCalledWith(expect.anything(), expect.objectContaining({
                status: '조리중',
            }));
        });
    });

    describe('updateOrderStatus', () => {
        it('should update order status and timestamp', async () => {
            (doc as any).mockReturnValue('MOCK_DOC_REF');

            await updateOrderStatus(mockStoreId, mockOrderId, '배달중');

            expect(doc).toHaveBeenCalledWith(expect.anything(), 'stores', mockStoreId, 'orders', mockOrderId);
            expect(updateDoc).toHaveBeenCalledWith('MOCK_DOC_REF', {
                status: '배달중',
                updatedAt: 'MOCK_TIMESTAMP',
            });
        });
    });

    describe('cancelOrder', () => {
        it('should set status to "취소"', async () => {
            (doc as any).mockReturnValue('MOCK_DOC_REF');

            await cancelOrder(mockStoreId, mockOrderId);

            expect(updateDoc).toHaveBeenCalledWith('MOCK_DOC_REF', {
                status: '취소',
                updatedAt: 'MOCK_TIMESTAMP',
            });
        });
    });

    describe('deleteOrder', () => {
        it('should delete the order document', async () => {
            (doc as any).mockReturnValue('MOCK_DOC_REF');
            // deleteOrder 내부의 dynamic import도 결국 mocks를 사용할 것으로 예상됨
            // 하지만 테스트 환경에 따라 모킹 방식이 다를 수 있음.
            // 여기서는 vi.mock이 top-level이므로 dynamic import도 모킹된 버전을 받을 것임.

            await deleteOrder(mockStoreId, mockOrderId);

            expect(deleteDoc).toHaveBeenCalledWith('MOCK_DOC_REF');
        });
    });
});

```

---

## File: src\services\orderService.ts

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

---

## File: src\services\reviewService.test.ts

```typescript
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { createReview, deleteReview } from './reviewService';
import { collection, addDoc, updateDoc, deleteDoc, doc } from 'firebase/firestore';

// Mock dependencies
vi.mock('../lib/firebase', () => ({
    db: {},
}));

vi.mock('firebase/firestore', async () => {
    const actual = await vi.importActual('firebase/firestore');
    return {
        ...actual,
        collection: vi.fn(),
        addDoc: vi.fn(),
        updateDoc: vi.fn(),
        deleteDoc: vi.fn(),
        doc: vi.fn(),
        serverTimestamp: vi.fn(() => 'MOCK_TIMESTAMP'),
        query: vi.fn(),
        where: vi.fn(),
        orderBy: vi.fn(),
        getDocs: vi.fn(),
    };
});

describe('reviewService', () => {
    const mockStoreId = 'store_123';
    const mockOrderId = 'order_abc';
    const mockReviewId = 'review_xyz';
    const mockUserId = 'user_1';

    beforeEach(() => {
        vi.clearAllMocks();
    });

    describe('createReview', () => {
        it('should create review and update order status', async () => {
            const mockDocRef = { id: 'new_review_id' };
            (addDoc as any).mockResolvedValue(mockDocRef);
            (collection as any).mockReturnValue('MOCK_COLLECTION_REF');
            (doc as any).mockReturnValue('MOCK_DOC_REF');

            const reviewData = {
                storeId: mockStoreId,
                orderId: mockOrderId,
                userId: mockUserId,
                userName: 'User',
                rating: 5,
                comment: 'Great!',
                images: [],
            };

            const result = await createReview(mockStoreId, reviewData);

            // 1. Review creation
            expect(collection).toHaveBeenCalledWith(expect.anything(), 'stores', mockStoreId, 'reviews');
            expect(addDoc).toHaveBeenCalledWith('MOCK_COLLECTION_REF', expect.objectContaining({
                ...reviewData,
                createdAt: 'MOCK_TIMESTAMP',
            }));

            // 2. Order update (reviewed: true)
            expect(doc).toHaveBeenCalledWith(expect.anything(), 'stores', mockStoreId, 'orders', mockOrderId);
            expect(updateDoc).toHaveBeenCalledWith('MOCK_DOC_REF', expect.objectContaining({
                reviewed: true,
                reviewText: 'Great!',
                reviewedAt: 'MOCK_TIMESTAMP',
            }));

            expect(result).toBe('new_review_id');
        });
    });

    describe('deleteReview', () => {
        it('should delete review and reset order status', async () => {
            (doc as any).mockReturnValue('MOCK_DOC_REF');

            await deleteReview(mockStoreId, mockReviewId, mockOrderId);

            // 1. Review delete
            expect(deleteDoc).toHaveBeenCalledWith('MOCK_DOC_REF');

            // 2. Order update (reviewed: false)
            expect(updateDoc).toHaveBeenCalledWith('MOCK_DOC_REF', expect.objectContaining({
                reviewed: false,
                reviewText: null,
            }));
        });

        it('should handle missing order document gracefully (review deleted, order update skipped)', async () => {
            (doc as any).mockReturnValue('MOCK_DOC_REF');

            // updateDoc throws "No document to update"
            (updateDoc as any).mockRejectedValueOnce(new Error('No document to update'));

            const consoleSpy = vi.spyOn(console, 'warn').mockImplementation(() => { });

            await expect(deleteReview(mockStoreId, mockReviewId, mockOrderId)).resolves.not.toThrow();

            expect(deleteDoc).toHaveBeenCalled(); // Review deleted
            expect(consoleSpy).toHaveBeenCalledWith(expect.stringContaining('주문 문서를 찾을 수 없어'), expect.anything());

            consoleSpy.mockRestore();
        });
    });
});

```

---

## File: src\services\reviewService.ts

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

---

## File: src\services\storageService.ts

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

## File: src\services\userService.test.ts

```typescript
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { searchUsers } from './userService';
import { getDocs, query, where, collection } from 'firebase/firestore';

// Mock dependencies
vi.mock('../lib/firebase', () => ({
    db: {},
}));

vi.mock('firebase/firestore', async () => {
    const actual = await vi.importActual('firebase/firestore');
    return {
        ...actual,
        collection: vi.fn(),
        query: vi.fn(),
        where: vi.fn(),
        getDocs: vi.fn(),
    };
});

describe('userService', () => {
    beforeEach(() => {
        vi.clearAllMocks();
    });

    describe('searchUsers', () => {
        it('should search by phone when input is numeric/hyphen', async () => {
            const mockResult = {
                docs: [
                    { id: 'u1', data: () => ({ name: 'Test', phone: '010-1234-5678' }) }
                ]
            };
            (getDocs as any).mockResolvedValue(mockResult);

            const result = await searchUsers('0101234');

            expect(where).toHaveBeenCalledWith('phone', '>=', '0101234');
            expect(result).toHaveLength(1);
        });

        it('should search by displayName when input is text', async () => {
            const mockResult = {
                docs: [
                    { id: 'u2', data: () => ({ displayName: 'Hong', phone: '010-0000-0000' }) }
                ]
            };
            (getDocs as any).mockResolvedValue(mockResult);

            const result = await searchUsers('Hong');

            expect(where).toHaveBeenCalledWith('displayName', '>=', 'Hong');
            expect(result).toHaveLength(1);
        });
    });
});

```

---

## File: src\services\userService.ts

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

---

