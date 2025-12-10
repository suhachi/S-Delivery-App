# 제1호 클라이언트 배포 로드맵 (KS Simple Delivery App)

이 문서는 **KS 단일 배달앱 템플릿(v1.0.0)**을 기반으로, **내일 진행할 제1호 클라이언트 상점 구축**을 위한 단계별 실행 가이드입니다.

---

## 0. 대원칙 (Operating Principles)

1.  **Immutable Reference**: `simple-delivery-template` 리포지토리의 `simple-delivery-v1.0.0` 태그는 **절대 수정하지 않는 기준점**입니다.
2.  **Clone & Detach**: 클라이언트 상점은 별도 리포지토리(`simple-delivery-shop-[NAME]`)로 분리하며, 템플릿의 코드를 가져다 쓰되 독립적으로 운영합니다.
3.  **Payment OFF First**: 초기 구축 단계에서는 **결제 설정 없이** 배포합니다. (상점 세팅 및 메뉴 등록이 우선)

---

## Phase 0: ⚠️ 필수 계정 점검 (Mandatory Check)
**배포 사고 방지를 위해 작업 시작 전 반드시 계정을 확인하세요.** (`docs/DEPLOYMENT_PREFLIGHT_CHECK.md` 참조)

1.  **로그인 계정 확인**:
    ```bash
    firebase login
    # -> "Already logged in as [올바른_계정]" 인지 확인!
    ```
2.  **프로젝트 권한 확인**:
    ```bash
    firebase projects:list
    # -> 생성하려는(또는 배포하려는) 프로젝트 ID가 목록에 보여야 함.
    ```

---

## Phase 1: 리포지토리 및 프로젝트 생성 (Start)

### 1-1. 클라이언트용 리포지토리 생성
1.  **새 리포지토리 생성**: `simple-delivery-shop-first-client` (예시)
2.  **템플릿 코드 가져오기**:
    ```bash
    # 1. 새 폴더 생성 및 진입
    mkdir simple-delivery-shop-first-client
    cd simple-delivery-shop-first-client

    # 2. git 초기화
    git init

    # 3. 템플릿 리포지토리 리모트 추가 (레퍼런스용)
    git remote add template https://github.com/KS-Company/simple-delivery-template.git

    # 4. v1.0.0 태그 가져오기
    git fetch template --tags
    git checkout tags/simple-delivery-v1.0.0 -b main
    
    # 5. 내 리포지토리 리모트 연결
    git remote remove template
    git remote add origin <새 리포지토리 URL>
    git push -u origin main
    ```

### 1-2. Firebase 프로젝트 생성
1.  [Firebase Console](https://console.firebase.google.com/) 접속
2.  **새 프로젝트 만들기**: `simple-delivery-shop-1` (예시)
3.  **요금제 설정**: Functions 사용 예정이므로 **Blaze(종량제)** 선택 (또는 개발 중엔 Spark 쓰다가 배포 시 변경)
    *   *Tip: 1호점은 바로 운영 예정이므로 Blaze 설정을 권장.*

---

## Phase 2: 연결 및 설정 (Configuration)

### 2-1. Firebase 연결 (`.firebaserc`)
- `simple-delivery-shop-first-client` 폴더 내 `.firebaserc` 수정:
```json
{
  "projects": {
    "default": "simple-delivery-shop-1"
  }
}
```

### 2-2. 환경변수 설정 (`.env`)
- 템플릿의 `.env.template`을 복사하여 `.env` 생성.
- **Firebase Web Config** 값을 새 프로젝트(`simple-delivery-shop-1`)의 값으로 교체.
- **NICEPAY Client ID는 비워둠 (`""`).**
```env
# Client Project Config
VITE_FIREBASE_PROJECT_ID=simple-delivery-shop-1
...
VITE_NICEPAY_CLIENT_ID=""  # 결제 OFF 상태 유지
```

### 2-3. 인증(Auth) 및 DB(Firestore) 초기화
1.  **Firebase 기능 활성화 (Console)**:
    - **Authentication**: Email/Password 공급업체 활성화.
    - **Firestore**: '프로덕션 모드'로 데이터베이스 생성.
    - **Storage**: 시작하기.
2.  **Security Rules 배포**:
    ```bash
    firebase deploy --only firestore:rules,storage
    ```

---

## Phase 3: 초기 데이터 및 계정 세팅 (Initialization)

### 3-1. 관리자 계정 생성
- 이 단계는 **초기 세팅을 위한 임시/최초 관리자**를 만드는 과정입니다.
- 앱을 로컬에서 실행(`npm run dev`)하거나, Firebase Console의 Authentication 탭에서 직접 사용자 추가.
    - 예: `admin@shop1.com` / `initpassword123`
- **Firestore에 관리자 권한 부여**:
    - `admins` 컬렉션에 해당 사용자 UID 문서 생성 (`role: "admin"`).
    - *참고: 이 과정은 `npm run dev` 후 `/admin` 접속 시 자동 생성 로직이 없으면 콘솔에서 수동 추가 필요.* (템플릿 로직: 회원가입 후 DB 조작 필요)

### 3-2. 배포 (Deployment)
- 코드는 v1.0.0 그대로임. 빌드 및 배포 실행.
```bash
npm install
npm run build
firebase deploy --only hosting,functions
```

---

## Phase 4: 클라이언트 제공 상태 완성 (Handover Ready)

### 4-1. "상점 세팅 마법사" 상태 확인
1.  배포된 URL (`https://simple-delivery-shop-1.web.app/admin`) 접속.
2.  `admin@shop1.com` 로그인.
3.  **"상점 정보가 없습니다. 설정을 시작하세요."** (StoreSetupWizard) 화면이 뜨는지 확인.
4.  이 상태가 바로 **클라이언트에게 전달할 "Start Line"**입니다.

### 4-2. 전달 패키지 준비
- **접속 URL**: `https://simple-delivery-shop-1.web.app/admin`
- **계정 정보**: `admin@shop1.com` / `initpassword123`
- **가이드**: "로그인 후 상점 정보를 입력하고 메뉴를 등록해 주세요."

---

## Phase 5: 운영 전환 (Activation - Future)

- 클라이언트가 메뉴/상점 등록을 마치고 영업 준비가 완료되었다고 연락이 오면 진행.
1.  **NicePay 계약 완료 확인**.
2.  **Key 수령**: Client Key, Secret Key.
3.  **Config 업데이트 (로컬 리포지토리에서)**:
    - `.env`: `VITE_NICEPAY_CLIENT_ID="실제키..."`
    - 터미널: `firebase functions:config:set nicepay.secret_key="실제키..."`
4.  **최종 재배포**:
    - `npm run build`
    - `firebase deploy`
5.  **영업 개시!**
