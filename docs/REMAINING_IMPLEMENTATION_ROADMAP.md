# “최종판” 원자(ATOMIC) 단위 작업 로드맵
*(결제는 NICEPAY 호출형 + Firebase Functions 서버 승인 기준)*

## White Phase 0. 사전 준비 (Git / Env / Firebase Functions)

### T0-1. Git 브랜치 및 안전망 준비
- [ ] **현재 main/master 최신 코드 기준으로 작업용 브랜치 생성**
  - 예: `feature/notices-events-nicepay`
- [ ] **필요 시 로컬에 백업용 태그/브랜치 추가**
  - 예: `backup/pre-nicepay`

### T0-2. 환경 변수 재점검 (.env 계열 정리)
- [ ] **루트 `.env` 또는 `.env.local` 하나를 기준으로 사용 결정**
- [ ] **다음 값들 존재/정합성 확인**
  - `VITE_FIREBASE_API_KEY` 등 기존 Firebase 값
  - `VITE_FIREBASE_AUTH_DOMAIN`
  - `VITE_FIREBASE_PROJECT_ID`
  - `VITE_FIREBASE_STORAGE_BUCKET`
- [ ] **NICEPAY용 환경 변수(프론트) 추가**
  - `VITE_NICEPAY_CLIENT_ID` (Nicepay 클라이언트 키)
  - `VITE_NICEPAY_RETURN_URL` (초기에는 프론트 리턴 페이지, 추후 Functions로 변경 예정)

### T0-3. Firebase CLI / 프로젝트 셋업 확인
- [ ] **`firebase login` (필요 시)**
- [ ] **`firebase use <project-id>`로 올바른 프로젝트 선택**
- [ ] **`firebase.json`에 `hosting` / `firestore` 설정 존재 확인**

### T0-4. Firebase Functions 초기화 (현재 없음 → 신규 생성)
- [ ] **루트에서 `firebase init functions` 실행**
  - 언어: `TypeScript` 선택
  - ESLint: 사용 여부는 선택 (권장: ON)
  - **주의**: 기존 파일 덮어쓰기 주의 (현재 functions 폴더 없음)
- [ ] **생성 확인**
  - `functions/` 폴더 생성
  - `functions/src/index.ts` 또는 `index.ts` 기본 템플릿 존재
  - `firebase.json`에 `"functions"` 설정 추가된 것 확인

### T0-5. Functions 환경 변수 준비 (서버용 시크릿)
- [ ] **NICEPAY 서버 시크릿 키는 클라이언트 env가 아니라 Functions에만 저장**
  - `firebase functions:config:set nicepay.secret_key="..."`
  - 이후 Confirm API에서 이 값을 사용하도록 설계

---

## 🟢 Phase 1. 고객 공지/이벤트 화면 구현

### 1-1. 공지사항 (Notices)
- [ ] **T1-1. 공지 서비스/타입 구조 파악**
  - `src/services/noticeService.ts` 내용 확인
  - `getAllNoticesQuery(storeId)` 쿼리 구조 (pinned/createdAt 정렬) 확인
  - `src/types/notice.ts` 타입 정의 확인
  - `src/components/notice/NoticeList.tsx` 재사용 가능성 확인 (Admin 종속성 체크)
- [ ] **T1-2. 고객용 NoticePage.tsx 생성**
  - 파일: `src/pages/NoticePage.tsx`
  - 로직: `useStore`로 `store.id` 획득, `getAllNoticesQuery` + `useFirestoreCollection`
  - UI: "공지사항" 타이틀, Pinned 강조, 목록 표시
- [ ] **T1-3. App.tsx 라우팅 연결 (/notices)**
  - `<Route path="/notices" element={<NoticePage />} />` 추가
  - RequireAuth 제외 (공개 접근)
- [ ] **T1-4. 공지 네비게이션 진입점 추가**
  - `src/components/common/TopBar.tsx`에 "공지사항" 메뉴 추가
- [ ] **T1-5. Firestore rules 및 동작 확인 (공지)**
  - `firestore.rules`에서 notices read 권한 (`allow read: if true`) 확인

### 1-2. 이벤트 (Events)
- [ ] **T1-6. 이벤트 서비스/타입 구조 파악**
  - `src/services/eventService.ts` 확인 (`getActiveEventsQuery`)
  - `src/types/event.ts` 확인
- [ ] **T1-7. EventList 컴포넌트 생성**
  - 파일: `src/components/event/EventList.tsx`
  - UI: 이미지, 제목, 기간, "진행중" 배지
- [ ] **T1-8. EventsPage.tsx 생성**
  - 파일: `src/pages/EventsPage.tsx`
  - UI: "이벤트" 타이틀, `EventList` 배치
- [ ] **T1-9. App.tsx 라우팅 (/events)**
  - `<Route path="/events" element={<EventsPage />} />` 추가
- [ ] **T1-10. 홈/배너에서 이벤트로 진입 연동**
  - 메인 페이지 배너/버튼 클릭 시 `/events`로 이동

### 1.5. 중간 QA (공지/이벤트만 독립 점검)
- [ ] **T1.5-1. 공지/이벤트 기능 QA**
  - 비로그인/로그인 상태 접근 테스트
  - 데이터 없을 때 빈 상태 확인

---

## � Phase 2. NICEPAY 호출형 결제 + 서버 승인

### 2-0. NICEPAY 클라이언트/서버 환경 구성
- [ ] **T2-0-1. 프론트 env 변수 확정** (`VITE_NICEPAY_CLIENT_ID`, `VITE_NICEPAY_RETURN_URL`)
- [ ] **T2-0-2. 글로벌 타입 선언 (AUTHNICE)**
  - `src/types/global.d.ts`: `Window { AUTHNICE }`, `NicepayRequestParams` 정의
- [ ] **T2-0-3. NICEPAY 스크립트 로더 유틸**
  - `src/lib/nicepay.ts`: `loadNicepayScript()`, `requestNicepayPayment()` 구현

### 2-1. 주문 생성/상태 설계 재정의 (결제 시점)
- [ ] **T2-1-1. 주문 생성 시점 결정**
  - 결제 전 '결제대기' 상태로 주문 생성 → doc.id를 NICEPAY orderId로 사용
- [ ] **T2-1-2. Order 타입 확장**
  - `paymentProvider`, `paymentMethod`, `paymentTid`, `paymentStatus`, `paidAt` 추가
- [ ] **T2-1-3. 주문 생성 서비스 수정**
  - `createOrder`가 초기 상태 및 결제 필드를 받아 저장하도록 수정

### 2-2. CheckoutPage 결제 플로우 (클라이언트)
- [ ] **T2-2-1. CheckoutPage 기존 구조 점검 & Critical 버그 수정**
  - **Critical**: `user.uid` → `user.id` 교체
  - UI: 더미 버튼 제거, "나이스페이 결제" 버튼 표시
- [ ] **T2-2-2. handleNicepayPayment 구현**
  - 데이터 검증 → '결제대기' 주문 생성 → `requestNicepayPayment` 호출
- [ ] **T2-2-3. 결제 성공 후 화면 처리**
  - 성공 시 `VITE_NICEPAY_RETURN_URL`로 리다이렉트 (NICEPAY 동작)

### 2-3. NICEPAY Return URL 처리 (1단계: 프론트 페이지)
- [ ] **T2-3-1. NicepayReturnPage.tsx 생성**
  - 파라미터 파싱 → "승인 처리중" UI → Cloud Functions 승인 API 호출
- [ ] **T2-3-2. App.tsx 라우팅 추가**
  - `/nicepay/return` 라우트 등록

### 2-4. Firebase Functions — NICEPAY 승인 API 연동
- [ ] **T2-4-1. Functions 내부 NICEPAY 클라이언트 유틸**
  - `functions/src/nicepayClient.ts`: 승인 API 호출 로직
- [ ] **T2-4-2. HTTP 함수: nicepayConfirm**
  - `nicepayConfirm` 함수 구현: 승인 API 호출 → Firestore Order 업데이트 ('결제완료')
- [ ] **T2-4-3. 프론트에서 nicepayConfirm 함수 호출**
  - `NicepayReturnPage`에서 호출 후 결과에 따라 완료/실패 처리
- [ ] **T2-4-4. 2단계 returnUrl 전환 (선택)** (추후 고도화)

### 2-5. 에러/예외 시나리오 설계 반영
- [ ] **T2-5-1. 결제창 취소 처리**
- [ ] **T2-5-2. 승인 API 실패 처리** (`paymentStatus: '결제실패'`)

### 2-6. NICEPAY 테스트 플로우 정의
- [ ] **T2-6-1. 샌드박스 테스트 카드 정보 문서화** (`docs/NICEPAY_TEST_GUIDE.md`)
- [ ] **T2-6-2. 수동 테스트 시나리오 수행**

---

## 🟠 Phase 3. 마무리 정리 & 최종 QA/배포

### 3-0. Critical 버그 선(先) 수정
- [ ] **T3-0-1. CheckoutPage user.uid → user.id** (Phase 2-2-1에서 선행됨)
- [ ] **T3-0-2. ReviewModal user.uid → user.id**
- [ ] **T3-0-3. 기타 user.uid 사용 여부 전수 조사 및 수정**

### 3-1. TS/ESLint 정리
- [ ] **T3-1-1. 타입 패키지 정리** (`npm i -D @types/react` 등)
- [ ] **T3-1-2. any 최소화** (결제/주문 관련 핵심 파일)
- [ ] **T3-1-3. 빌드 기반 타입 체크**

### 3-2. Firestore 인덱스/규칙 배포
- [ ] **T3-2-1. 인덱스 배포** (`firebase deploy --only firestore:indexes`)
- [ ] **T3-2-2. Rules 배포** (`firebase deploy --only firestore:rules`)

### 3-3. 프로덕션 빌드 & 프리뷰
- [ ] **T3-3-1. 빌드** (`npm run build`)
- [ ] **T3-3-2. 프리뷰** (`npm run preview`)

### 3-4. 최종 QA & 승인 선언
- [ ] **T3-4-1. Checklist 재점검**
- [ ] **T3-4-2. 프로젝트 상태 보고서 업데이트** (`PROJECT_STATUS_REPORT_AND_ROADMAP.md`)
