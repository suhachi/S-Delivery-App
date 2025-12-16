# KS 심플배달앱 - 관리자 초기 진입 흐름

**생성일**: 2025-12-10  
**목적**: 점주에게 어디서부터 시작하라고 말해야 하는지 고정

---

## 1. README.md (운영 기준용)

**파일 위치**: 프로젝트 루트

**전체 원본 코드**:

```markdown
# Simple Delivery App

배달 주문 관리 시스템 - React + Firebase 기반의 배달 앱

## 🚀 시작하기

### 필수 요구사항

- Node.js 18+ 
- npm 또는 yarn
- Firebase 프로젝트

### 설치

```bash
npm install
```

### 환경 변수 설정

`.env` 파일을 생성하고 Firebase 설정 값을 입력하세요:

```env
VITE_FIREBASE_API_KEY=your-api-key
VITE_FIREBASE_AUTH_DOMAIN=your-project.firebaseapp.com
VITE_FIREBASE_PROJECT_ID=your-project-id
VITE_FIREBASE_STORAGE_BUCKET=your-project.appspot.com
VITE_FIREBASE_MESSAGING_SENDER_ID=your-sender-id
VITE_FIREBASE_APP_ID=your-app-id
VITE_FIREBASE_MEASUREMENT_ID=your-measurement-id
```

자세한 설정 방법은 [FIREBASE_SETUP_GUIDE.md](./FIREBASE_SETUP_GUIDE.md)를 참조하세요.

### 개발 서버 실행

```bash
npm run dev
```

브라우저에서 `http://localhost:5173` 접속

### 빌드

```bash
npm run build
```

## 📚 문서

- [FIREBASE_SETUP_GUIDE.md](./FIREBASE_SETUP_GUIDE.md) - Firebase 연동 상세 가이드
- [FIREBASE_CHECKLIST.md](./FIREBASE_CHECKLIST.md) - Firebase 연동 체크리스트
- [ADMIN_SETUP.md](./ADMIN_SETUP.md) - 관리자 계정 설정 가이드
- [QUICK_START.md](./QUICK_START.md) - 빠른 시작 가이드
- [FIREBASE_INTEGRATION_REPORT.md](./FIREBASE_INTEGRATION_REPORT.md) - Firebase 연동 작업 보고서

## 🛠️ 기술 스택

- **Frontend**: React 18, TypeScript, Vite
- **UI**: Tailwind CSS, Radix UI
- **Backend**: Firebase (Firestore, Authentication, Storage)
- **Routing**: React Router DOM
- **State Management**: React Context API

## 📁 프로젝트 구조

```
simple-delivery-app/
├── src/
│   ├── components/     # React 컴포넌트
│   ├── contexts/       # Context API
│   ├── hooks/          # Custom Hooks
│   ├── lib/            # Firebase 설정 및 유틸리티
│   ├── pages/          # 페이지 컴포넌트
│   ├── services/       # Firebase 서비스
│   ├── types/          # TypeScript 타입 정의
│   └── utils/          # 유틸리티 함수
├── src/firestore.rules # Firestore 보안 규칙
├── src/storage.rules   # Storage 보안 규칙
└── .env                # 환경 변수 (생성 필요)
```

## 🔥 Firebase 서비스

- **Authentication**: 이메일/비밀번호 인증
- **Firestore**: NoSQL 데이터베이스
- **Storage**: 파일 저장소 (이미지 업로드)
- **Cloud Messaging**: 푸시 알림 (선택사항)

## 📋 주요 기능

### 사용자 기능
- 회원가입/로그인
- 메뉴 탐색 및 검색
- 장바구니 관리
- 주문 생성 및 조회
- 리뷰 작성
- 쿠폰 사용

### 관리자 기능
- 대시보드 (통계)
- 메뉴 관리
- 주문 관리
- 쿠폰 관리
- 리뷰 관리
- 공지사항 관리
- 이벤트 배너 관리
- 상점 설정

## 🔒 보안

- Firestore 보안 규칙 배포 완료
- Storage 보안 규칙 배포 완료
- 환경 변수 Git 제외 설정

## 📝 라이선스

이 프로젝트는 개인 프로젝트입니다.

## 🤝 기여

이슈 및 풀 리퀘스트를 환영합니다!

---

**개발 시작일**: 2024년 12월  
**Firebase 연동 완료일**: 2024년 12월 6일
```

---

## 2. 관리자 첫 로그인 → 상점 생성 흐름 설명

### 전체 흐름 개요

```
1. 관리자 계정 생성 (Firebase Console)
   ↓
2. 관리자로 로그인
   ↓
3. 상점이 없으면 자동 리다이렉트 → /store-setup
   ↓
4. 상점 설정 마법사 (4단계)
   ↓
5. 상점 생성 완료 → /admin 대시보드
```

---

### 단계별 상세 설명

#### 1단계: 관리자 계정 생성

**방법 1: Firebase Console에서 수동 생성**

1. Firebase Console > Firestore Database > 데이터 탭
2. 컬렉션 시작 클릭
3. 컬렉션 ID: `admins` 입력
4. 문서 ID: 관리자로 설정할 사용자의 Firebase Auth UID 입력
5. 필드 추가:
   - `isAdmin` (boolean): `true`
   - `createdAt` (timestamp): 현재 시간

**방법 2: Firebase CLI 사용**

```bash
firebase firestore:set admins/{userId} '{"isAdmin": true, "createdAt": "2024-01-01T00:00:00Z"}'
```

**방법 3: 앱에서 회원가입 후 수동 승인**

1. 일반 사용자로 회원가입
2. Firebase Console에서 해당 사용자 UID를 `admins` 컬렉션에 추가

---

#### 2단계: 관리자로 로그인

**로그인 페이지**: `/login`

**데모 계정** (템플릿 프로젝트):
- 이메일: `admin@demo.com`
- 비밀번호: `admin123`

**실제 운영 시**:
- 관리자 계정을 Firebase Authentication에서 생성
- 또는 일반 회원가입 후 `admins` 컬렉션에 추가

---

#### 3단계: 상점 없음 감지 및 리다이렉트

**파일 위치**: `src/App.tsx`

**코드 로직**:
```typescript
// RequireAuth 컴포넌트 내부
if (requireAdmin && isAdmin && !store && !storeLoading) {
  if (location.pathname !== '/store-setup') {
    return <Navigate to="/store-setup" replace />;
  }
}
```

**동작**:
- 관리자로 로그인했지만 상점이 없는 경우
- 자동으로 `/store-setup` 페이지로 리다이렉트
- 상점이 이미 있으면 `/admin` 대시보드로 이동

---

#### 4단계: 상점 설정 마법사

**파일 위치**: `src/pages/StoreSetupWizard.tsx`

**4단계 구성**:

**1단계: 기본 정보**
- 상점 이름 (필수, 최소 2자)
- 상점 설명

**2단계: 연락처**
- 전화번호 (필수)
- 이메일 (필수, 로그인한 사용자 이메일 자동 입력)
- 주소 (필수)

**3단계: 배달 설정**
- 배달비 (기본값: 3,000원)
- 최소 주문 금액 (기본값: 15,000원)

**4단계: 완료**
- 입력한 정보 확인
- "상점 생성" 버튼 클릭

**상점 생성 로직**:
```typescript
// 1. 상점 데이터 문서 생성 (stores/default)
await setDoc(doc(db, 'stores', 'default'), {
  ...formData,
  createdAt: serverTimestamp(),
  updatedAt: serverTimestamp(),
});

// 2. 관리자-상점 매핑 생성 (adminStores/{userId}_default)
await setDoc(doc(db, 'adminStores', `${user.uid}_default`), {
  adminUserId: user.uid,
  storeId: 'default',
  createdAt: serverTimestamp(),
});
```

**상점 ID**: 현재는 `default`로 고정 (단일 상점 구조)

---

#### 5단계: 상점 생성 완료

**자동 동작**:
- 상점 생성 성공 시 `/admin` 대시보드로 자동 이동
- `StoreContext`가 새로 생성된 상점 데이터를 로드
- 관리자 페이지 접근 가능

---

### 관련 컴포넌트 파일

| 파일 경로 | 설명 |
|----------|------|
| `src/pages/StoreSetupWizard.tsx` | 상점 설정 마법사 페이지 (4단계) |
| `src/App.tsx` | 라우팅 및 상점 없음 감지 로직 |
| `src/contexts/StoreContext.tsx` | 상점 데이터 관리 (stores/default 구독) |
| `src/contexts/AuthContext.tsx` | 인증 상태 관리 |
| `src/hooks/useIsAdmin.ts` | 관리자 권한 확인 |

---

### 관리자 초기 설정 체크리스트

**Firebase Console 설정**:
- [ ] Firebase 프로젝트 생성
- [ ] Authentication 활성화 (이메일/비밀번호)
- [ ] Firestore Database 생성
- [ ] Storage 활성화
- [ ] 관리자 계정 생성 (`admins/{userId}`)

**앱 설정**:
- [ ] `.env` 파일 생성 및 Firebase Config 입력
- [ ] `npm install` 실행
- [ ] `npm run dev` 실행하여 개발 서버 시작

**관리자 로그인**:
- [ ] `/login` 페이지에서 관리자 계정으로 로그인
- [ ] 자동으로 `/store-setup` 페이지로 리다이렉트되는지 확인
- [ ] 상점 설정 마법사 4단계 완료
- [ ] `/admin` 대시보드 접근 확인

---

### 문제 해결

**Q: 관리자로 로그인했는데 `/store-setup`으로 리다이렉트되지 않아요**
- A: `admins/{userId}` 문서가 Firestore에 생성되었는지 확인
- A: `useIsAdmin` 훅이 올바르게 동작하는지 확인

**Q: 상점 생성 후에도 계속 `/store-setup`으로 리다이렉트돼요**
- A: `stores/default` 문서가 올바르게 생성되었는지 Firestore Console에서 확인
- A: `StoreContext`가 상점 데이터를 올바르게 로드하는지 확인

**Q: 관리자 권한이 인식되지 않아요**
- A: Firebase Console > Firestore > `admins` 컬렉션에 해당 사용자 UID 문서가 있는지 확인
- A: 문서에 `isAdmin: true` 필드가 있는지 확인

---

**다음 문서**: [KS-06-FRONTEND-ENTRY.md](./KS-06-FRONTEND-ENTRY.md)

