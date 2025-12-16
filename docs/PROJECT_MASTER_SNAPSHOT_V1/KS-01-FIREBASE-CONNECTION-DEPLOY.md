# KS 심플배달앱 - Firebase 연결 & 배포 구조

**생성일**: 2025-12-10  
**목적**: Firebase 연결 및 배포 구조 원본 고정

---

## 1. .firebaserc

**파일 위치**: 프로젝트 루트

```json
{
  "projects": {
    "default": "simple-delivery-app-9d347"
  }
}
```

**⚠️ 중요**: 
- 템플릿 프로젝트 ID입니다
- 클라이언트 프로젝트 생성 시 반드시 변경해야 합니다
- `firebase use <project-id>` 명령어로 변경 가능

---

## 2. firebase.json

**파일 위치**: 프로젝트 루트

```json
{
    "firestore": {
        "rules": "firestore.rules",
        "indexes": "src/firestore.indexes.json"
    },
    "functions": [
        {
            "source": "functions",
            "codebase": "default",
            "ignore": [
                "node_modules",
                ".git",
                "firebase-debug.log",
                "firebase-debug.*.log"
            ],
            "predeploy": [
                "npm --prefix \"$RESOURCE_DIR\" run build"
            ]
        }
    ],
    "hosting": {
        "public": "build",
        "ignore": [
            "firebase.json",
            "**/.*",
            "**/node_modules/**"
        ],
        "rewrites": [
            {
                "source": "**",
                "destination": "/index.html"
            }
        ]
    },
    "storage": {
        "rules": "storage.rules"
    }
}
```

**설명**:
- `firestore.rules`: Firestore 보안 규칙 파일 경로
- `firestore.indexes.json`: Firestore 인덱스 설정 파일 경로
- `hosting.public`: 빌드 출력 디렉토리 (`build`)
- `storage.rules`: Storage 보안 규칙 파일 경로

---

## 3. firestore.rules

**파일 위치**: 프로젝트 루트

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

**핵심 규칙**:
- `stores/{storeId}`: 공개 읽기, 관리자만 쓰기
- `stores/{storeId}/menus`: 공개 읽기, 관리자만 쓰기
- `stores/{storeId}/orders`: 본인 또는 관리자만 읽기, 본인만 생성
- `stores/{storeId}/reviews`: 공개 읽기, 본인 생성, 본인/관리자 수정/삭제
- `users/{userId}`: 본인 또는 관리자만 읽기, 본인만 쓰기
- `admins/{userId}`: 본인만 읽기
- `adminStores/{docId}`: 본인 매핑만 읽기

---

## 4. storage.rules

**파일 위치**: 프로젝트 루트

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

**핵심 규칙**:
- 기본적으로 모든 경로 거부
- `store/`, `menus/`, `events/`, `reviews/`: 공개 읽기, 인증된 사용자 쓰기
- `profiles/{userId}/`: 공개 읽기, 본인만 쓰기

---

## 배포 명령어

```bash
# 전체 배포
npm run firebase:deploy

# 개별 배포
firebase deploy --only hosting
firebase deploy --only firestore:rules,firestore:indexes
firebase deploy --only storage
firebase deploy --only functions
```

---

**다음 문서**: [KS-02-FIRESTORE-STRUCTURE.md](./KS-02-FIRESTORE-STRUCTURE.md)

