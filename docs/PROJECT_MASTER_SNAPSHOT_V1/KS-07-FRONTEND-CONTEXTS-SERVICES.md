# KS 심플배달앱 - Contexts & Services 구조 설명

**생성일**: 2025-12-10  
**목적**: Contexts와 Services 구조 및 역할 설명

---

## 1. src/contexts/ 내 핵심 Context 설명

### 1.1 AuthContext (인증 관리)

**파일 위치**: `src/contexts/AuthContext.tsx`

**역할**:
- 사용자 인증 상태 관리
- 관리자 권한 확인
- 로그인/회원가입/로그아웃 기능 제공

**제공하는 값**:
```typescript
{
  user: User | null;              // 현재 로그인한 사용자
  isAdmin: boolean;               // 관리자 여부
  loading: boolean;                // 로딩 상태
  login: (email, password) => Promise;     // 로그인 함수
  signup: (email, password, ...) => Promise;  // 회원가입 함수
  logout: () => Promise<void>;    // 로그아웃 함수
}
```

**사용 예시**:
```typescript
import { useAuth } from '../contexts/AuthContext';

function MyComponent() {
  const { user, isAdmin, login, logout } = useAuth();
  
  if (!user) {
    return <LoginForm onLogin={login} />;
  }
  
  return <div>안녕하세요, {user.email}님</div>;
}
```

**내부 구현**:
- `useFirebaseAuth` 훅 사용 (Firebase Authentication 연동)
- `useIsAdmin` 훅 사용 (Firestore `admins` 컬렉션 확인)

---

### 1.2 StoreContext (상점 데이터 관리)

**파일 위치**: `src/contexts/StoreContext.tsx`

**역할**:
- 단일 상점 데이터 관리 (`stores/default`)
- 실시간 Firestore 구독 (onSnapshot)
- 상점 정보 전역 제공

**제공하는 값**:
```typescript
{
  store: Store | null;            // 상점 데이터
  loading: boolean;                // 로딩 상태
  error: Error | null;             // 에러 상태
  refreshStore: () => Promise<void>;  // 수동 새로고침 (거의 사용 안 함)
}
```

**사용 예시**:
```typescript
import { useStore } from '../contexts/StoreContext';

function MenuPage() {
  const { store, loading } = useStore();
  
  if (loading) return <Loading />;
  if (!store) return <NoStore />;
  
  return <div>{store.name}의 메뉴</div>;
}
```

**내부 구현**:
- Firestore `stores/default` 문서 실시간 구독
- 상점이 없으면 `store`가 `null`로 설정
- 관리자 초기 설정 마법사에서 상점 생성

---

### 1.3 CartContext (장바구니 관리)

**파일 위치**: `src/contexts/CartContext.tsx`

**역할**:
- 장바구니 아이템 관리
- localStorage 자동 동기화
- 총 금액/수량 계산

**제공하는 값**:
```typescript
{
  items: CartItem[];               // 장바구니 아이템 목록
  addItem: (item) => void;         // 아이템 추가
  removeItem: (id) => void;        // 아이템 제거
  updateQuantity: (id, qty) => void;  // 수량 변경
  clearCart: () => void;           // 장바구니 비우기
  getTotalPrice: () => number;     // 총 금액 계산
  getTotalItems: () => number;     // 총 아이템 수 계산
}
```

**CartItem 타입**:
```typescript
{
  id: string;                       // 고유 ID
  menuId: string;                   // 메뉴 ID
  name: string;                     // 메뉴 이름
  price: number;                    // 가격
  quantity: number;                 // 수량
  options?: MenuOption[];           // 옵션 (추가 요금 등)
  imageUrl?: string;                // 이미지 URL
}
```

**사용 예시**:
```typescript
import { useCart } from '../contexts/CartContext';

function CartPage() {
  const { items, getTotalPrice, clearCart } = useCart();
  
  return (
    <div>
      {items.map(item => <CartItem key={item.id} item={item} />)}
      <div>총 금액: {getTotalPrice()}원</div>
      <button onClick={clearCart}>비우기</button>
    </div>
  );
}
```

**내부 구현**:
- `useState`로 장바구니 상태 관리
- `useEffect`로 localStorage 자동 동기화
- 페이지 새로고침해도 장바구니 유지

---

## 2. src/services/ 구조 설명

### 2.1 전체 구조

**디렉토리**: `src/services/`

**파일 목록**:
- `menuService.ts`: 메뉴 CRUD
- `orderService.ts`: 주문 생성 및 관리
- `couponService.ts`: 쿠폰 관리
- `reviewService.ts`: 리뷰 관리
- `noticeService.ts`: 공지사항 관리
- `eventService.ts`: 이벤트 관리
- `userService.ts`: 사용자 프로필 관리
- `storageService.ts`: 이미지 업로드 (Firebase Storage)

**공통 패턴**:
- 모든 서비스는 `storeId`를 첫 번째 파라미터로 받음
- Firestore 경로는 `stores/{storeId}/subcollection` 형식
- Query 헬퍼 함수 제공 (필터링, 정렬)

---

### 2.2 menuService.ts (메뉴 관리)

**주요 함수**:
```typescript
// 메뉴 생성
createMenu(storeId: string, menuData: Omit<Menu, 'id' | 'createdAt'>): Promise<string>

// 메뉴 수정
updateMenu(storeId: string, menuId: string, menuData: Partial<Menu>): Promise<void>

// 메뉴 삭제
deleteMenu(storeId: string, menuId: string): Promise<void>

// Query 헬퍼
getAllMenusQuery(storeId: string): Query
getMenusByCategoryQuery(storeId: string, category: string): Query
```

**Firestore 경로**: `stores/{storeId}/menus`

**사용 위치**:
- `AdminMenuManagement.tsx`: 관리자 메뉴 관리 페이지
- `MenuPage.tsx`: 사용자 메뉴 목록 페이지

---

### 2.3 orderService.ts (주문 관리)

**주요 함수**:
```typescript
// 주문 생성 (핵심!)
createOrder(storeId: string, orderData: Omit<Order, 'id' | 'createdAt' | 'updatedAt'>): Promise<string>

// 주문 상태 변경
updateOrderStatus(storeId: string, orderId: string, status: OrderStatus): Promise<void>

// 주문 취소
cancelOrder(storeId: string, orderId: string): Promise<void>

// 주문 삭제
deleteOrder(storeId: string, orderId: string): Promise<void>

// Query 헬퍼
getUserOrdersQuery(storeId: string, userId: string): Query
getAllOrdersQuery(storeId: string): Query
getOrdersByStatusQuery(storeId: string, status: OrderStatus): Query
```

**Firestore 경로**: `stores/{storeId}/orders`

**주문 생성 위치**:
- `CheckoutPage.tsx`: 결제 완료 후 주문 생성
- `NicepayReturnPage.tsx`: 결제 콜백 후 주문 생성

**주문 상태 흐름**:
```
접수 → 준비중 → 배달중 → 완료
         ↓
        취소
```

---

### 2.4 couponService.ts (쿠폰 관리)

**주요 함수**:
```typescript
// 쿠폰 생성
createCoupon(storeId: string, couponData: Omit<Coupon, 'id' | 'createdAt' | 'updatedAt'>): Promise<string>

// 쿠폰 사용
useCoupon(storeId: string, couponId: string, userId: string, orderId: string): Promise<void>

// 활성 쿠폰 조회
getActiveCouponsQuery(storeId: string): Query
```

**Firestore 경로**: `stores/{storeId}/coupons`

**사용 위치**:
- `AdminCouponManagement.tsx`: 관리자 쿠폰 관리
- `CheckoutPage.tsx`: 결제 페이지에서 쿠폰 적용

---

### 2.5 reviewService.ts (리뷰 관리)

**주요 함수**:
```typescript
// 리뷰 생성
createReview(storeId: string, reviewData: Omit<Review, 'id' | 'createdAt' | 'updatedAt'>): Promise<string>

// 리뷰 수정/삭제
updateReview(storeId: string, reviewId: string, data: Partial<Review>): Promise<void>
deleteReview(storeId: string, reviewId: string, orderId: string): Promise<void>

// Query 헬퍼
getAllReviewsQuery(storeId: string): Query
```

**Firestore 경로**: `stores/{storeId}/reviews`

**사용 위치**:
- `ReviewBoardPage.tsx`: 리뷰 목록 페이지
- `OrderDetailPage.tsx`: 주문 상세에서 리뷰 작성
- `AdminReviewManagement.tsx`: 관리자 리뷰 관리

---

### 2.6 noticeService.ts (공지사항 관리)

**주요 함수**:
```typescript
// 공지사항 생성
createNotice(storeId: string, noticeData: Omit<Notice, 'id' | 'createdAt' | 'updatedAt'>): Promise<string>

// 공지사항 수정/삭제
updateNotice(storeId: string, noticeId: string, data: Partial<Notice>): Promise<void>
deleteNotice(storeId: string, noticeId: string): Promise<void>

// 고정 토글
toggleNoticePinned(storeId: string, noticeId: string, pinned: boolean): Promise<void>

// Query 헬퍼
getAllNoticesQuery(storeId: string): Query
```

**Firestore 경로**: `stores/{storeId}/notices`

**사용 위치**:
- `NoticePage.tsx`: 공지사항 목록 페이지
- `AdminNoticeManagement.tsx`: 관리자 공지사항 관리

---

### 2.7 eventService.ts (이벤트 관리)

**주요 함수**:
```typescript
// 이벤트 생성
createEvent(storeId: string, eventData: Omit<Event, 'id' | 'createdAt' | 'updatedAt'>): Promise<string>

// 이벤트 수정/삭제
updateEvent(storeId: string, eventId: string, data: Partial<Event>): Promise<void>
deleteEvent(storeId: string, eventId: string): Promise<void>

// 활성화 토글
toggleEventActive(storeId: string, eventId: string, active: boolean): Promise<void>

// Query 헬퍼
getAllEventsQuery(storeId: string): Query
getActiveEventsQuery(storeId: string): Query
```

**Firestore 경로**: `stores/{storeId}/events`

**사용 위치**:
- `EventsPage.tsx`: 이벤트 목록 페이지
- `AdminEventManagement.tsx`: 관리자 이벤트 관리
- `EventBanner.tsx`: 메인 페이지 이벤트 배너

---

### 2.8 userService.ts (사용자 프로필 관리)

**주요 함수**:
```typescript
// 사용자 프로필 조회
getUserProfile(userId: string): Promise<UserProfile | null>

// 사용자 프로필 업데이트
updateUserProfile(userId: string, data: Partial<UserProfile>): Promise<void>

// 사용자 검색 (관리자용)
searchUsers(query: string): Promise<UserProfile[]>
```

**Firestore 경로**: `users/{userId}` (전역 컬렉션)

**사용 위치**:
- `MyPage.tsx`: 사용자 프로필 수정
- `AdminCouponManagement.tsx`: 쿠폰 발급 대상 검색

---

### 2.9 storageService.ts (이미지 업로드)

**주요 함수**:
```typescript
// 메뉴 이미지 업로드
uploadMenuImage(file: File, menuId: string): Promise<string>

// 상점 이미지 업로드 (로고/배너)
uploadStoreImage(file: File, type: 'logo' | 'banner'): Promise<string>

// 이벤트 이미지 업로드
uploadEventImage(file: File, eventId: string): Promise<string>

// 리뷰 이미지 업로드
uploadReviewImage(file: File, reviewId: string): Promise<string>
```

**Firebase Storage 경로**:
- `menus/{menuId}/{filename}`
- `store/{type}/{filename}`
- `events/{eventId}/{filename}`
- `reviews/{reviewId}/{filename}`

**사용 위치**:
- `ImageUpload.tsx`: 공통 이미지 업로드 컴포넌트
- `AdminMenuManagement.tsx`: 메뉴 이미지 업로드
- `AdminStoreSettings.tsx`: 상점 로고/배너 업로드

---

## 3. Firestore 접근 패턴

### 올바른 사용법

```typescript
import { useStore } from '../contexts/StoreContext';
import { getAllMenusQuery } from '../services/menuService';
import { useFirestoreCollection } from '../hooks/useFirestoreCollection';

function MenuPage() {
  const { store } = useStore();
  
  // ✅ storeId를 사용하여 Query 생성
  const { data: menus } = useFirestoreCollection<Menu>(
    store?.id ? getAllMenusQuery(store.id) : null
  );
  
  return <div>{menus?.map(menu => <MenuCard key={menu.id} menu={menu} />)}</div>;
}
```

### 잘못된 사용법

```typescript
// ❌ storeId 없이 직접 접근
const menusRef = collection(db, 'menus');

// ❌ 하드코딩된 경로
const menusRef = collection(db, 'stores/default/menus');
```

---

## 4. 주문 생성 위치

**주요 위치**: `src/pages/CheckoutPage.tsx`

**주문 생성 흐름**:
1. 사용자가 결제 페이지에서 주문 정보 입력
2. NICEPAY 결제 진행
3. 결제 완료 후 `orderService.createOrder()` 호출
4. Firestore `stores/{storeId}/orders`에 주문 문서 생성

**결제 콜백**: `src/pages/NicepayReturnPage.tsx`
- NICEPAY 결제 완료 후 리다이렉트
- 결제 검증 후 주문 생성

---

**다음 문서**: [KS-08-OPERATION-STATE.md](./KS-08-OPERATION-STATE.md)

