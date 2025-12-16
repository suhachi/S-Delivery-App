# 프로젝트 마스터 스냅샷 v1.0.0 - Firebase 백엔드

**생성일**: 2025-12-10  
**목적**: Firebase 백엔드 설정 파일 원본 보관 (Firestore Rules, Indexes, Storage Rules)

---

## 1. firestore.rules (전체 원본)

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    
    // Helper function to check admin privileges
    function isAuthorizedAdmin() {
      return request.auth != null && (
        exists(/databases/$(database)/documents/admins/$(request.auth.uid)) || 
        exists(/databases/$(database)/documents/adminStores/$(request.auth.uid + '_default')) ||
        request.auth.token.email == 'jsbae59@gmail.com' ||
        request.auth.token.email == 'admin@demo.com'
      );
    }

    // =========================================================================
    // 1. PUBLIC DATA (공개 데이터)
    // =========================================================================
    
    // 상점 정보
    match /stores/{storeId} {
      allow read: if true;
      allow write: if isAuthorizedAdmin();
      
      // 메뉴
      match /menus/{menuId} {
        allow read: if true;
        allow write: if isAuthorizedAdmin();
      }
      
      // 공지사항
      match /notices/{noticeId} {
        allow read: if true;
        allow write: if isAuthorizedAdmin();
      }
      
      // 이벤트
      match /events/{eventId} {
        allow read: if true;
        allow write: if isAuthorizedAdmin();
      }
      
      match /reviews/{reviewId} {
        allow read: if true;
        allow create: if request.auth != null && request.resource.data.userId == request.auth.uid;
        allow update, delete: if isAuthorizedAdmin() || (request.auth != null && resource.data.userId == request.auth.uid);
      }
      
      // 주문 (본인만)
      match /orders/{orderId} {
         allow read: if request.auth != null && (resource.data.userId == request.auth.uid || isAuthorizedAdmin());
         allow create: if request.auth != null && request.resource.data.userId == request.auth.uid;
         allow update: if isAuthorizedAdmin() || (
           request.auth != null && 
           resource.data.userId == request.auth.uid && 
           request.resource.data.diff(resource.data).affectedKeys().hasOnly(['reviewed', 'reviewText', 'reviewRating', 'reviewedAt', 'updatedAt'])
         );
         allow delete: if isAuthorizedAdmin(); // 삭제 기능 추가
      }
      
      // 쿠폰 (읽기는 공개, 생성/삭제는 관리자, 수정은 사용 처리 위해 로그인 유저 허용)
      match /coupons/{couponId} {
        allow read: if true;
        allow create, delete: if isAuthorizedAdmin();
        allow update: if isAuthorizedAdmin() || request.auth != null;
      }
    }

    // =========================================================================
    // 2. USER DATA (사용자 데이터)
    // =========================================================================
    
    // 사용자 프로필
    match /users/{userId} {
      allow read: if request.auth != null && (request.auth.uid == userId || isAuthorizedAdmin());
      allow write: if request.auth != null && request.auth.uid == userId;
    }
    
    // 시스템 관리자 목록
    match /admins/{userId} {
      allow read: if request.auth != null && request.auth.uid == userId;
    }
    
    // 관리자-상점 매핑
    match /adminStores/{docId} {
      allow read: if request.auth != null && docId.matches('^' + request.auth.uid + '_.*');
      allow write: if false;
    }

    // =========================================================================
    // 3. SYSTEM ADMIN (시스템 관리자)
    // =========================================================================
    
    match /{document=**} {
      allow read, write: if false;
    }
  }
}
```

**원본 파일 위치**: 프로젝트 루트의 `firestore.rules`

---

## 2. src/firestore.indexes.json (전체 원본)

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

**원본 파일 위치**: `src/firestore.indexes.json`

**중요 사항**:
- `menus.category` 필드는 `arrayConfig: "CONTAINS"`를 사용하여 `array-contains` 쿼리를 지원합니다.
- 단일 필드 인덱스는 Firestore가 자동으로 생성하므로 명시적으로 정의할 필요가 없습니다.

---

## 3. storage.rules (전체 원본)

```javascript
rules_version = '2';
service firebase.storage {
  match /b/{bucket}/o {
    // 기본적으로 모든 읽기/쓰기 거부
    match /{allPaths=**} {
      allow read, write: if false;
    }

    // 상점 이미지 (로고, 배너) - 읽기: 모두, 쓰기: 인증된 사용자
    match /store/{allPaths=**} {
      allow read: if true;
      allow write: if request.auth != null;
    }

    // 메뉴 이미지 - 읽기: 모두, 쓰기: 인증된 사용자
    match /menus/{allPaths=**} {
      allow read: if true;
      allow write: if request.auth != null;
    }

    // 이벤트 이미지 - 읽기: 모두, 쓰기: 인증된 사용자
    match /events/{allPaths=**} {
      allow read: if true;
      allow write: if request.auth != null;
    }

    // 리뷰 이미지 - 읽기: 모두, 쓰기: 인증된 사용자
    match /reviews/{allPaths=**} {
      allow read: if true;
      allow write: if request.auth != null;
    }
    
    // 프로필 이미지 - 읽기: 모두, 쓰기: 본인만 (간소화를 위해 인증된 사용자 허용)
    match /profiles/{userId}/{allPaths=**} {
      allow read: if true;
      allow write: if request.auth != null && request.auth.uid == userId;
    }
  }
}
```

**원본 파일 위치**: 프로젝트 루트의 `storage.rules`

---

**배포 명령어**:

```bash
# Firestore Rules & Indexes 배포
firebase deploy --only firestore:rules,firestore:indexes

# Storage Rules 배포
firebase deploy --only storage
```

---

**다음 문서**: [03-FIREBASE-FUNCTIONS.md](./03-FIREBASE-FUNCTIONS.md)

