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
