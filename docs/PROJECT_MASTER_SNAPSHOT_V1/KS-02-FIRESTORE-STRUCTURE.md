# KS 심플배달앱 - Firestore 구조 고정

**생성일**: 2025-12-10  
**목적**: Firestore 데이터 모델 & 권한 사고 방지 목적

---

## 1. firestore.indexes.json

**파일 위치**: `src/firestore.indexes.json`

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

**인덱스 요약**:
- `orders`: status, userId, adminDeleted 조합 인덱스
- `reviews`: status + createdAt
- `notices`: pinned + createdAt
- `menus`: category (array-contains) + createdAt
- `events`: active + startDate/endDate
- `coupons`: isActive + createdAt

---

## 2. Firestore 컬렉션 구조 설명

### 전체 구조 개요

심플배달앱은 **멀티 테넌트 구조**를 사용합니다. 모든 상점별 데이터는 `stores/{storeId}/subcollection` 형태로 격리됩니다.

```
Firestore Database
├── stores/                    # 상점 정보 (루트 컬렉션)
│   └── {storeId}/             # 상점별 문서 (기본값: 'default')
│       ├── menus/             # 서브컬렉션: 메뉴
│       ├── orders/            # 서브컬렉션: 주문
│       ├── coupons/           # 서브컬렉션: 쿠폰
│       ├── reviews/           # 서브컬렉션: 리뷰
│       ├── notices/           # 서브컬렉션: 공지사항
│       └── events/            # 서브컬렉션: 이벤트
├── users/                     # 전역 사용자 프로필
├── admins/                    # 시스템 관리자 목록
└── adminStores/               # 관리자-상점 매핑
```

---

### 1. stores (상점 정보)

**경로**: `stores/{storeId}`

**문서 ID**: 
- 단일 상점 구조: `default` (고정)
- 향후 멀티 스토어 확장 시: 동적 생성

**스키마**:
```typescript
{
  id: string;                    // 문서 ID
  name: string;                  // 상점 이름
  description: string;           // 상점 설명
  phone: string;                 // 전화번호
  email?: string;                // 이메일
  address: string;               // 주소
  openingHours?: {               // 영업시간 (선택)
    mon: { open: string; close: string };
    tue: { open: string; close: string };
    // ... 모든 요일
  };
  deliveryFee: number;            // 배달비
  minOrderAmount: number;         // 최소 주문 금액
  logoUrl?: string;              // 로고 이미지 URL
  bannerUrl?: string;            // 배너 이미지 URL
  primaryColor?: string;          // 메인 테마 색상
  createdAt: Timestamp;
  updatedAt: Timestamp;
}
```

**접근 권한**:
- 읽기: 모든 사용자 (공개)
- 쓰기: 관리자만

---

### 2. stores/{storeId}/menus (메뉴)

**경로**: `stores/{storeId}/menus/{menuId}`

**스키마**:
```typescript
{
  id: string;
  name: string;                  // 메뉴 이름
  description?: string;          // 메뉴 설명
  price: number;                 // 가격
  category: string[];             // 카테고리 (배열)
  imageUrl?: string;             // 이미지 URL
  isAvailable: boolean;           // 판매 가능 여부
  options?: MenuOption[];         // 옵션 (추가 요금 등)
  createdAt: Timestamp;
  updatedAt: Timestamp;
}
```

**접근 권한**:
- 읽기: 모든 사용자 (공개)
- 쓰기: 관리자만

**인덱스**:
- `category (array-contains) + createdAt (desc)`: 카테고리별 메뉴 조회

---

### 3. stores/{storeId}/orders (주문)

**경로**: `stores/{storeId}/orders/{orderId}`

**스키마**:
```typescript
{
  id: string;
  userId: string;                // 주문자 UID
  userName: string;              // 주문자 이름
  userPhone: string;             // 주문자 전화번호
  items: OrderItem[];             // 주문 항목
  totalPrice: number;             // 총 금액
  deliveryFee: number;            // 배달비
  discountAmount: number;         // 할인 금액
  finalPrice: number;             // 최종 결제 금액
  status: OrderStatus;           // 주문 상태: '접수' | '준비중' | '배달중' | '완료' | '취소'
  deliveryAddress: string;       // 배달 주소
  paymentMethod: string;          // 결제 방법
  paymentId?: string;             // 결제 ID (NICEPAY)
  reviewed: boolean;              // 리뷰 작성 여부
  reviewText?: string;            // 리뷰 내용
  reviewRating?: number;          // 리뷰 평점
  reviewedAt?: Timestamp;        // 리뷰 작성일
  adminDeleted?: boolean;         // 관리자 삭제 플래그
  createdAt: Timestamp;
  updatedAt: Timestamp;
}
```

**접근 권한**:
- 읽기: 본인 또는 관리자
- 생성: 본인만
- 수정: 관리자 또는 본인 (리뷰 관련 필드만)
- 삭제: 관리자만

**인덱스**:
- `status + createdAt (desc)`: 상태별 주문 조회
- `userId + createdAt (desc)`: 사용자별 주문 조회
- `adminDeleted + createdAt (desc)`: 삭제된 주문 조회
- `status + adminDeleted + createdAt (desc)`: 상태별 + 삭제 플래그 조회

---

### 4. stores/{storeId}/coupons (쿠폰)

**경로**: `stores/{storeId}/coupons/{couponId}`

**스키마**:
```typescript
{
  id: string;
  code: string;                  // 쿠폰 코드
  name: string;                  // 쿠폰 이름
  discountType: 'fixed' | 'percentage';  // 할인 타입
  discountValue: number;          // 할인 금액 또는 퍼센트
  maxDiscountAmount?: number;     // 최대 할인 금액 (percentage일 때)
  minOrderAmount: number;         // 최소 주문 금액
  validFrom: Timestamp;          // 유효 시작일
  validUntil: Timestamp;          // 유효 종료일
  isActive: boolean;              // 활성화 여부
  createdAt: Timestamp;
  updatedAt: Timestamp;
}
```

**접근 권한**:
- 읽기: 모든 사용자 (공개)
- 생성/삭제: 관리자만
- 수정: 관리자 또는 인증된 사용자 (사용 처리)

**인덱스**:
- `isActive + createdAt (desc)`: 활성 쿠폰 조회

---

### 5. stores/{storeId}/reviews (리뷰)

**경로**: `stores/{storeId}/reviews/{reviewId}`

**스키마**:
```typescript
{
  id: string;
  orderId: string;               // 주문 ID
  userId: string;                // 작성자 UID
  userName: string;              // 작성자 이름
  menuName: string;              // 메뉴 이름
  rating: number;                // 평점 (1-5)
  comment: string;               // 리뷰 내용
  status: 'pending' | 'approved' | 'rejected';  // 승인 상태
  adminReply?: string;           // 관리자 답글
  createdAt: Timestamp;
  updatedAt: Timestamp;
}
```

**접근 권한**:
- 읽기: 모든 사용자 (공개)
- 생성: 본인만
- 수정/삭제: 본인 또는 관리자

**인덱스**:
- `status + createdAt (desc)`: 상태별 리뷰 조회

---

### 6. stores/{storeId}/notices (공지사항)

**경로**: `stores/{storeId}/notices/{noticeId}`

**스키마**:
```typescript
{
  id: string;
  title: string;                 // 제목
  content: string;               // 내용
  category: string;              // 카테고리: '공지' | '이벤트' | '점검' | '할인'
  pinned: boolean;               // 상단 고정 여부
  createdAt: Timestamp;
  updatedAt: Timestamp;
}
```

**접근 권한**:
- 읽기: 모든 사용자 (공개)
- 쓰기: 관리자만

**인덱스**:
- `pinned + createdAt (desc)`: 고정 공지사항 우선 조회

---

### 7. stores/{storeId}/events (이벤트)

**경로**: `stores/{storeId}/events/{eventId}`

**스키마**:
```typescript
{
  id: string;
  title: string;                 // 제목
  description: string;            // 설명
  imageUrl?: string;              // 이미지 URL
  startDate: Timestamp;          // 시작일
  endDate: Timestamp;             // 종료일
  active: boolean;                // 활성화 여부
  createdAt: Timestamp;
  updatedAt: Timestamp;
}
```

**접근 권한**:
- 읽기: 모든 사용자 (공개)
- 쓰기: 관리자만

**인덱스**:
- `active + startDate (asc)`: 활성 이벤트 조회
- `active + endDate (desc)`: 종료 예정 이벤트 조회

---

### 8. users (전역 사용자 프로필)

**경로**: `users/{userId}`

**문서 ID**: Firebase Auth UID

**스키마**:
```typescript
{
  uid: string;                    // Firebase Auth UID
  email: string;                  // 이메일
  displayName?: string;           // 표시 이름
  phoneNumber?: string;           // 전화번호
  createdAt: Timestamp;
  updatedAt: Timestamp;
}
```

**접근 권한**:
- 읽기: 본인 또는 관리자
- 쓰기: 본인만

---

### 9. admins (시스템 관리자 목록)

**경로**: `admins/{userId}`

**문서 ID**: Firebase Auth UID

**스키마**:
```typescript
{
  isAdmin: boolean;               // true
  createdAt: Timestamp;
}
```

**접근 권한**:
- 읽기: 본인만
- 쓰기: 없음 (수동 생성)

**설정 방법**:
1. Firebase Console에서 수동 생성
2. 또는 Firebase CLI 사용:
   ```bash
   firebase firestore:set admins/{userId} '{"isAdmin": true, "createdAt": "2024-01-01T00:00:00Z"}'
   ```

---

### 10. adminStores (관리자-상점 매핑)

**경로**: `adminStores/{docId}`

**문서 ID 형식**: `{userId}_{storeId}` (예: `user123_default`)

**스키마**:
```typescript
{
  adminUserId: string;            // 관리자 UID
  storeId: string;                // 상점 ID
  createdAt: Timestamp;
}
```

**접근 권한**:
- 읽기: 본인 매핑만 (docId가 `{userId}_*` 형식)
- 쓰기: 없음 (자동 생성)

**용도**:
- 관리자가 여러 상점을 관리할 수 있도록 하는 매핑 테이블
- 현재는 단일 상점 구조이므로 `{userId}_default` 형식만 사용

---

## 데이터 격리 규칙

### ✅ 올바른 사용법

```typescript
import { collection } from 'firebase/firestore';
import { getMenusPath } from '../lib/firestorePaths';

// ✅ 상점별 메뉴 조회
const menusRef = collection(db, getMenusPath(storeId));
```

### ❌ 잘못된 사용법

```typescript
// ❌ 상점 ID 없이 직접 접근
const menusRef = collection(db, 'menus');
```

---

## 경로 헬퍼 함수

**파일 위치**: `src/lib/firestorePaths.ts`

```typescript
export function getMenusPath(storeId: string): string {
  return `stores/${storeId}/menus`;
}

export function getOrdersPath(storeId: string): string {
  return `stores/${storeId}/orders`;
}

export function getCouponsPath(storeId: string): string {
  return `stores/${storeId}/coupons`;
}

export function getReviewsPath(storeId: string): string {
  return `stores/${storeId}/reviews`;
}

export function getNoticesPath(storeId: string): string {
  return `stores/${storeId}/notices`;
}

export function getEventsPath(storeId: string): string {
  return `stores/${storeId}/events`;
}
```

---

**다음 문서**: [KS-03-ENV-TEMPLATE.md](./KS-03-ENV-TEMPLATE.md)

