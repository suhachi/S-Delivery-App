# 🛠️ 로컬 테스트 및 점검 체크리스트

이 문서는 "단일 상점 배달앱 템플릿"을 로컬 환경에서 실행하고 검증하기 위한 상세 가이드입니다. 
최근 감사(Audit)에서 발견된 리스크를 중심으로, 안전하고 확실한 테스트 절차를 안내합니다.

> **작업 전 확인사항**
> - 터미널 위치: 프로젝트 루트 (`d:\projectsing\hyun-poong\simple-delivery-app`)
> - Node 버전: v18+ 권장
> - Firebase CLI 로그인 계정: `jsbae59@gmail.com`

---

## 1. 환경 설정 점검 (Environment Config)

- [ ] **`.env` 파일 확인**
  - `VITE_FIREBASE_API_KEY`, `VITE_FIREBASE_AUTH_DOMAIN` 등이 `simple-delivery-app-9d347` 프로젝트 값인지 확인.
  - `VITE_NICEPAY_CLIENT_ID` 값이 있는지 확인 (없으면 결제 테스트 시 에러 발생).
  
- [ ] **`.firebaserc` 파일 확인**
  - `default` 프로젝트가 `simple-delivery-app-9d347`로 설정되어 있는지 확인.
  ```json
  {
    "projects": {
      "default": "simple-delivery-app-9d347"
    }
  }
  ```

- [ ] **Dependency 설치 확인**
  - `node_modules`가 없다면 `npm install` 실행.
  
---

## 2. 보안 및 권한 점검 (Critical Fix Validation)

**가장 중요한 단계입니다.** 이전 감사에서 발견된 하드코딩된 이메일 문제를 해결해야 합니다.

- [ ] **`firestore.rules` 수정 확인** (T01-01)
  - `d:\projectsing\hyun-poong\simple-delivery-app\firestore.rules` 파일 열기.
  - `request.auth.token.email == 'jsbae59@gmail.com'` 또는 `admin@demo.com`과 같은 **하드코딩된 이메일 조건이 제거되었는지 확인**.
  - 대신 `admins` 컬렉션이나 `adminStores` 규칙만 남아있어야 함.
  - **수정 후 배포 필수**: `firebase deploy --only firestore:rules`

- [ ] **관리자 권한 부여 (로컬/서버)**
  - Firebase Console -> Firestore -> `admins` 컬렉션에 본인 UID 문서 추가 (내용: `{ role: "admin" }` 등).
  - 또는 `adminStores` 컬렉션에 `[UID]_default` 문서 확인.

---

## 3. 로컬 실행 및 결제 프록시 설정 (Local Dev Setup)

로컬(`localhost:3000`)에서 Cloud Functions(`nicepayConfirm`)를 호출하려면 Proxy 설정이 필요합니다.

- [ ] **`vite.config.ts` 프록시 설정 추가** (T02-01)
  - `server` 블록에 아래 설정이 있는지 확인 (없으면 추가):
  ```typescript
  server: {
    proxy: {
      '/nicepayConfirm': {
        target: 'http://127.0.0.1:5001/simple-delivery-app-9d347/us-central1/nicepayConfirm',
        changeOrigin: true, 
        rewrite: (path) => path.replace(/^\/nicepayConfirm/, '')
      }
    }
  }
  ```
  *(참고: target 주소는 `firebase emulators:start` 실행 시 나오는 Functions 주소로 맞춰야 함)*

- [ ] **Functions 에뮬레이터 실행**
  - 새 터미널 열기 -> `firebase emulators:start --only functions`
  - "Functions: nicepayConfirm: http://127.0.0.1:5001/..." 로그 확인.

- [ ] **Frontend 실행**
  - `npm run dev`
  - 브라우저에서 `http://localhost:3000` 접속.

---

## 4. 기능 테스트 시나리오 (Functional Test)

### 4-1. 일반 사용자 플로우
- [ ] **메인 페이지 진입**
  - 상점 데이터(`stores/default`)가 없을 때: "오픈 준비 중입니다" 또는 빈 화면이 뜨는지 확인 (UX 개선 필요 포인트).
  - 상점 데이터가 있을 때: 가게명, 로고 등 정상 표시 확인.
- [ ] **로그인/회원가입**
  - Google 로그인 또는 이메일 회원가입 테스트.
- [ ] **장바구니 담기**
  - `/menu` -> 메뉴 선택 -> 옵션 선택 -> 장바구니 담기.
  - `/cart`에서 수량 변경, 삭제 동작 확인.

### 4-2. 주문 및 결제 (Payment Flow)
- [ ] **주문서 작성 (`/checkout`)**
  - 배달/포장 선택.
  - 주소/전화번호 미입력 시 "주문하기" 버튼 비활성화 또는 경고 확인.
- [ ] **결제 시도 (앱결제)**
  - NICEPAY Client ID가 `.env`에 없으면 -> Toast 에러 메시지 확인 ("관리자에게 문의하세요").
  - ID가 있으면 -> 결제창(모달/팝업) 뜨는지 확인.
- [ ] **결제 승인 (Return Page)**
  - 결제 완료 후 `/nicepay/return`으로 리다이렉트됨.
  - **성공 케이스**: 로컬 Functions 에뮬레이터 로그에 "NICEPAY Confirm Success" 뜨고, 화면에 "결제 성공" 표시.
  - **실패 케이스**: Functions가 꺼져있거나 Proxy 설정 없으면 -> "서버 통신 오류" 확인.

### 4-3. 관리자 플로우
- [ ] **관리자 페이지 진입 (`/admin`)**
  - 일반 사용자 로그인 시 -> 진입 불가 (메인으로 리다이렉트).
  - 관리자 계정 로그인 시 -> 대시보드 정상 진입.
- [ ] **상점 설정 (`/admin/store-settings`)**
  - 가게 공지사항, 영업시간 수정 후 "저장" -> 오류 없이 반영되는지 확인.
- [ ] **메뉴 관리 (`/admin/menus`)**
  - 메뉴 추가/수정/삭제 테스트.
  - "품절" 토글 동작 확인.

---

## 5. 최종 배포 전 점검 (Pre-flight Check)

- [ ] **빌드 테스트**
  - `npm run build` 실행 시 에러(`TSC`, `Vite` 관련) 없는지 확인.
- [ ] **Lint 체크**
  - `npm run lint` (설정된 경우) 또는 IDE상 빨간 줄(에러) 없는지 전체 스캔.
- [ ] **콘솔 로그 확인**
  - 브라우저 개발자 도구(F12) Console 탭에 "Red Error"가 없는지 확인.
  - (파란색/노란색 Warning은 허용 가능하나 가능한 줄이기)

---

**위 체크리스트를 모두 통과하면 템플릿은 "복제 준비 완료(Production Ready)" 상태입니다.**
운영 단계로 넘어가거나, 다른 상점에 이 템플릿을 복제하여 배포할 수 있습니다.
