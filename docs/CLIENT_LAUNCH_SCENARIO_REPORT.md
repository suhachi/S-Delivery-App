# 🚀 KS 배달앱 클라이언트 런칭 시나리오 및 절차서

이 문서는 **KS 단일 배달앱 템플릿(simple-delivery-app)**을 복제하여 **새로운 클라이언트(점주)**에게 독립된 앱 서비스를 제공하기까지의 **A to Z 절차**를 담고 있습니다.

---

## 📋 1. 사전 준비 (Prerequisites)

클라이언트 런칭 작업을 시작하기 전에 아래 정보를 점주에게서 수집하거나 내부적으로 결정해야 합니다.

### 점주에게 요청할 정보
1.  **서비스명 (상호명)**: 앱 제목/상단바에 표시될 이름 (예: `라이옥 쌀국수`, `현풍닭칼국수`).
2.  **초기 관리자 이메일/비밀번호**: 점주가 관리자 페이지에 로그인할 계정 정보.
3.  **사업자 등록 정보 & NICEPAY 가입 여부**: (PG 연동 시 필수, 초기엔 없어도 무관).
4.  **로고 이미지 (선택)**: 초기 세팅해주면 좋음.

### 내부 준비 사항
1.  **새 리포지토리 이름**: `simple-delivery-shop-[상호명영문]` (예: `simple-delivery-shop-abcbraised`)
2.  **새 Firebase 프로젝트 ID**: `[상호명영문]-app` (예: `abcbraised-app`)
3.  **작업자 계정 권한**: 해당 Firebase 프로젝트 생성/배포 권한 보유 확인.

---

## 🏃 2. 구축 및 런칭 시나리오 (Step-by-Step)

### Step 1: 프로젝트 복제 및 환경 구성 (Clone & Setup)
**목표**: 템플릿 코드(v1.0.0)를 기반으로 독립된 프로젝트 환경을 만든다.

1.  **Git 리포지토리 생성 및 클론**:
    - 새 폴더 생성: `mkdir simple-delivery-shop-[NAME]`
    - `git init` 후 템플릿(Remote)에서 `simple-delivery-v1.0.0` 태그를 `checkout`.
    - `git remote remove template` (템플릿과의 연결 끊기).
    - 새 리포지토리 Remote 연결: `git remote add origin [NEW_REPO_URL]`.

2.  **Firebase 프로젝트 생성 (Console)**:
    - [Firebase Console](https://console.firebase.google.com)에서 새 프로젝트 생성.
    - **Blaze 요금제 사용 설정** (Functions 사용 필수).
    - **Auth**: 이메일/비밀번호 로그인 활성화.
    - **Firestore**: 프로덕션 모드로 데이터베이스 생성 (`nam5` 등 리전 선택).
    - **Storage**: 버킷 생성.

3.  **의존성 설치**:
    - `npm install`

### Step 2: 프로젝트 연결 및 권한 설정 (Configuration)
**목표**: 코드가 엉뚱한(템플릿) 곳이 아닌, 방금 만든 새 프로젝트를 바라보게 한다.

1.  **Firebase 연결 (`.firebaserc`)**:
    - `.firebaserc` 파일 열기.
    - `"default": "새-프로젝트-ID"`로 수정.

2.  **환경변수 설정 (`.env`)**:
    - `.env.template`을 복사해 `.env` 생성.
    - **Firebase 설정값 교체**: 새 프로젝트의 '앱 추가' > '웹 앱' 설정값(apiKey 등) 복사 붙여넣기.
    - **결제 설정**: `VITE_NICEPAY_CLIENT_ID=""` (초기엔 반드시 **빈 값**으로 유지).

3.  **안전장치 업데이트 (`scripts/check-deploy.mjs`)**:
    - `const REQUIRED_ACCOUNT` 변수 업데이트 (작업자 이메일).
    - `const REQUIRED_PROJECT` 변수 확인 (새 프로젝트 ID 자동 감지 or 수정).
    - *이 단계가 없으면 배포 스크립트가 "잘못된 프로젝트"라고 막을 수 있음.*

### Step 3: 백엔드 & 인프라 배포 (Infrastructure)
**목표**: 서버리스 기능과 데이터베이스 보안 규칙을 배포한다.

1.  **계정 점검 (필수 Step Phase 0)**:
    - `npm run firebase:login` (올바른 계정인지 확인).

2.  **인프라 배포**:
    ```bash
    npm run firebase:deploy:firestore  # 보안 규칙 & 인덱스
    npm run firebase:deploy:storage    # 스토리지 규칙
    npm run firebase:deploy:functions  # 클라우드 함수 (결제 승인 등)
    ```

3.  **초기 관리자 계정 생성 (Console)**:
    - Firebase Console > Authentication > '사용자 추가'.
    - 점주 이메일(`owner@newshop.com`) / 비밀번호 생성.
    - **Firestore > `admins` 컬렉션에 해당 UID 문서 생성 (`role: "admin"`).** (필수)

### Step 4: 프론트엔드 배포 (Deployment)
**목표**: 고객과 점주가 접속할 웹사이트를 오픈한다.

1.  **빌드**:
    ```bash
    npm run build
    ```
    - 에러 없이 `dist` 폴더 생성 확인.

2.  **호스팅 배포**:
    ```bash
    npm run firebase:deploy:hosting
    ```
    - 배포 완료 후 `https://[새-프로젝트-ID].web.app` 접속 확인.

### Step 5: 데이터 초기화 및 검증 (Initialization)
**목표**: 앱이 "텅 빈, 깨끗한 상태"인지 확인한다.

1.  **관리자 접속**:
    - `https://[새-프로젝트-ID].web.app/admin` 접속.
    - 생성한 점주 계정으로 로그인.
2.  **상점 설정 마법사 확인**:
    - 아직 상점 데이터가 없으므로 **"상점 정보를 등록해주세요"** 화면(Setup Wizard)이 떠야 정상.
3.  **고객 화면 확인**:
    - `https://[새-프로젝트-ID].web.app` 접속.
    - **"메뉴 준비 중"** 또는 상점 정보가 없다는 안내가 뜨는지 확인.

---

## 📦 3. 클라이언트 전달 패키지 (Handover Pack)

모든 배포가 끝났으면 아래 정보를 정리해 클라이언트에게 전달합니다.

### 📝 전달 보고서 양식
> **[전달] OOO점 주문앱 세팅 완료 안내**
>
> 1. **관리자 페이지 (점주님용)**
>    - URL: `https://[프로젝트ID].web.app/admin`
>    - 계정: `[등록한이메일]` / `[초기비밀번호]`
>    - **[할 일]**: 로그인 후 상점 정보와 메뉴를 등록해 주세요.
>
> 2. **고객 주문 페이지 (손님용)**
>    - URL: `https://[프로젝트ID].web.app`
>    - (추후 도메인 연결 가능)
>
> 3. **결제 설정 안내**
>    - 메뉴 등록 후 영업 준비가 되시면 NICEPAY 가맹점 계약을 완료해주세요.
>    - 발급받은 `Client Key`와 `Secret Key`를 저희에게 전달해 주시면 실결제 기능을 켜드립니다.

---

## ✅ 4. 최종 체크리스트

- [ ] `.firebaserc`가 새 프로젝트 ID를 가리키는가?
- [ ] `.env`에 `VITE_NICEPAY_CLIENT_ID`가 비어있는가? (결제 OFF 확인)
- [ ] `check-deploy.mjs` 안전장치가 통과되는가?
- [ ] Firestore Security Rules가 정상 배포되었는가?
- [ ] 관리자 로그인 시 "상점 설정 마법사"로 유도되는가?
- [ ] 모바일/PC 화면에서 기본 UI 깨짐이 없는가?

이 절차대로 진행하면, 기술적인 지식이 없는 점주도 안전하게 본인의 앱을 **"정보 입력"**부터 시작할 수 있습니다. 🚀
