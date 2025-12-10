# KS 단일 배달앱 – 템플릿 복제 & 온보딩 운영 모델 (AI용 가이드)

## 0. 목적

이 문서는 KS컴퍼니가 운영하는 단일 상점 배달앱 템플릿을 여러 상점(클라이언트)으로 복제·배포할 때의 표준 운영 모델을 정의한다.

또한, 이 문서를 읽는 AI 도구들(안티그래비티, Cursor, Copilot 등)이 아래 원칙에 맞춰 자동화 작업 / 코드 수정 / 셋업 스크립트 작성을 수행할 수 있도록 한다.

## 1. 기본 개념

### 템플릿 리포지토리 1개
단일 상점 배달앱의 “정식 템플릿” 코드베이스.
React + Vite + TypeScript + Firebase(Firestore/Auth/Storage/Functions).

### 상점별 복제 리포지토리 N개
각 상점마다 템플릿을 Git 복제하여 개별 리포를 생성.
예:
- `simple-delivery-template` (마스터 템플릿)
- `simple-delivery-shop-rae-oak`
- `simple-delivery-shop-abc-chicken`

### Firebase 프로젝트 = 상점 1개
각 복제본 리포지토리는 서로 다른 Firebase Project에 연결.
같은 Firestore 스키마, 같은 Security Rules, 같은 Functions 구조를 사용한다.
달라지는 것은 프로젝트 ID / API 키 / NicePay 키 / 도메인뿐이다.

### 클라이언트(점주)는 코드 작업 없음
점주는 `/admin`에서 상점 정보, 메뉴, 공지, 이벤트, 쿠폰만 세팅.
Firebase 콘솔, 코드 수정, 배포 작업은 모두 KS가 담당한다.

## 2. 공통 Firebase 설정 원칙

### Security Rules / Schema 공통 사용
`firestore.rules`, `storage.rules`, Functions 구조는 템플릿에서 1회 정의.
복제본 프로젝트에서도 동일한 Rules 파일을 그대로 배포한다.
단, Rules 안에 특정 이메일/UID/프로젝트 ID 하드코딩은 금지.
예: `request.auth.token.email == "jsbae@..."` 같은 조건 제거.
권한은 `admins`, `adminStores` 등의 컬렉션 기반으로만 제어.

### 환경변수만 상점별로 분리
- `.env` (프론트):
  - `VITE_FIREBASE_*`
  - `VITE_NICEPAY_CLIENT_ID` (점주별 Client ID)
- `functions:config` (백엔드):
  - `nicepay.secret_key` (점주별 Secret Key)

### 결제/PG 전략 (중요)
- **템플릿 프로젝트**: 결제 기능 **OFF** (키 미설정). 코드/구조 레퍼런스용.
- **Demo 프로젝트**: **Sandbox Key** 설정 (테스트/시연용).
- **Client 프로젝트**: **Real Key** 설정 (실서비스용).

### 함수/엔드포인트 이름 표준화
예: `/nicepayConfirm`, `/api/admin/...` 등
엔드포인트 경로를 템플릿에서 고정해 두고, 복제본에서도 동일한 경로를 사용한다.

## 3. 새 상점 온보딩 – KS 내부 표준 플로우

### 3.1. Step 1 – 템플릿에서 복제본 생성
1. 템플릿 리포지토리를 기반으로 새 리포 생성
   - 예: `simple-delivery-shop-<shop-name>`
2. `.firebaserc` 업데이트
   - `projects.default = <새 Firebase 프로젝트 ID>`
3. `.env` 템플릿 생성
   - `VITE_FIREBASE_*` 를 새 Firebase 프로젝트의 config로 교체
   - `VITE_NICEPAY_CLIENT_ID` 는 초기에는 비워두거나(템플릿 기본값) sandbox 키 사용
4. Firebase 프로젝트 생성 후 연결
   - Firestore / Auth / Storage 활성화
   - `firebase init` 관련 설정은 템플릿과 동일하게 유지

### 3.2. Step 2 – “초기 상태”로 세팅 (데이터 관점)
**목표:** 클라이언트가 앱을 처음 열면 **“아무 상점도 없는 상태 → 상점 설정 마법사”**로 자연스럽게 흐르도록.

1. **Firestore 데이터 정리**
   - `stores`, `menus`, `orders`, `reviews`, `coupons`, `events` 등 테스트 데이터를 모두 삭제.
   - 필요한 경우, `stores`는 아예 비워둔다. (또는 `stores/default` 템플릿 문서를 만들고, 첫 접속 시 수정 유도)
2. **Auth 계정 정리**
   - 테스트 계정 삭제.
   - 점주용 관리자 계정 1개 생성: 예: `owner@shop.com` / 초기 비밀번호
   - KS 내부 운영 계정이 필요하면 별도 admin 계정만 추가.
3. **Storage 정리**
   - 테스트용 이미지(메뉴/리뷰) 삭제 (필요 시).
   - 공통 로고/베너 등 “기본 템플릿 리소스”만 남긴다.

### 3.3. Step 3 – 코드 레벨 “초기 세팅 플로우” 보장
1. **관리자 첫 로그인 플로우**
   - `/admin` 진입 시, 현재 로그인한 관리자에게 연결된 `storeId`가 없으면:
     - `/admin/store-setup` (상점 설정 마법사)로 강제 이동.
   - 상점 설정 화면에서 입력하는 정보:
     - 상호명, 주소, 전화번호, 영업시간, 최소 주문금액, 배달비, 로고 등.
   - 저장 시 `stores/{storeId}` 문서 최초 생성.
2. **상점 생성 이후 플로우**
   - 상점 문서가 생성되면:
     - `/admin` 대시보드: 주문/메뉴/쿠폰/이벤트/공지 메뉴 활성화.
     - 고객 앱 `/menu`: 상점 정보/로고/기본 문구 노출, 메뉴가 없다면 “메뉴 준비 중” 안내.
3. **규칙**
   - 어떤 복제본이라도, 관리자가 처음 로그인하면:
     - “상점 생성이 안 되어 있으면 → 설정 마법사”
     - “상점 생성이 되어 있으면 → 일반 관리자 대시보드”
   - 이 규칙을 AI가 절대 변경하지 않도록 한다.

### 3.4. Step 4 – 클라이언트 전달 & 점주 할 일
1. **KS가 클라이언트에게 전달하는 것**
   - 배포 URL: 예: `https://<project-id>.web.app`
   - 관리자 URL: `https://<project-id>.web.app/admin`
   - 관리자 계정(이메일/비밀번호)
   - 간단 매뉴얼:
     ① 상점 정보 입력
     ② 메뉴/옵션/공지/이벤트/쿠폰 등록
     ③ 나이스페이 계약 후 키 전달 방법
2. **클라이언트(점주)가 직접 하는 일**
   - `/admin` 접속 → 상점 정보 최초 등록
   - 메뉴/카테고리/옵션 등록
   - 공지/이벤트/쿠폰(필요 시) 등록
   - 나이스페이 계약 후 Client ID / Secret Key를 KS에게 전달

### 3.5. Step 5 – KS의 결제 키 연동 & 실서비스 전환
1. **KS 측 환경변수 세팅**
   - `.env.local` or `.env`: `VITE_NICEPAY_CLIENT_ID="<점주 Client ID>"`
   - `firebase functions:config:set nicepay.secret_key="<점주 Secret Key>"`
2. **재배포**
   - `firebase deploy --only functions,hosting`
3. **최종 검증**
   - 테스트 결제 1건 실행 (Sandbox 또는 소액 Live)
   - 주문 생성 → 결제 → 관리자 주문 수신 플로우 확인
4. **“실사용 가능” 상태 선언**
   - 이후부터는 상점 운영은 점주가, 코드/인프라 관리는 KS가 담당.

## 4. AI 도구용 작업 원칙 (중요 Invariants)

AI(안티그래비티, Cursor, Copilot 등)가 이 프로젝트에서 자동 작업을 수행할 때 반드시 지켜야 할 규칙:

1. **Security Rules / Schema는 템플릿 기준 공통 세트**
   - 상점별 복제본에서 Rules 구조를 임의 변경하지 않는다.
   - 단, 심각한 보안 이슈 수정은 템플릿 리포에서 먼저 수정하고, 이후 각 복제본에는 템플릿 변경분을 반영하는 방식으로만 수정한다.

2. **Firebase 프로젝트 분리는 “환경/데이터 분리”가 목적**
   - 같은 코드 + 같은 Rules + 다른 데이터 세트(상점/주문/리뷰 등).
   - AI는 `projectId` / `.env` / `functions:config` 외에는 상점별로 구조를 바꾸지 않는다.

3. **초기 세팅 플로우(상점 생성 마법사)는 항상 유지**
   - `stores`가 비어 있는 상태를 “에러”로 취급하지 말 것.
   - 이 상태는 “처음 온 상점이 아직 초기 설정을 하지 않은 상태”이다.
   - 따라서, 이 상태에서의 동작은 항상:
     - 관리자 로그인 → 상점 설정 페이지로 유도
     - 고객 앱은 “준비 중” 화면만 표시하도록 유지.

4. **점주는 코드/배포를 건드리지 않는다**
   - AI는 점주가 코드/환경변수/Rules를 직접 수정한다고 가정하지 않는다.
   - 자동화 스크립트/프롬프트는 항상 “KS 개발자용”으로 설계한다.

5. **템플릿 프로젝트에서는 결제 키를 설정하지 않는다**
   - 템플릿 Firebase 프로젝트에서는 `VITE_NICEPAY_CLIENT_ID`와 `functions:config nicepay.secret_key`를 설정하지 않고 **결제 OFF 상태**로 유지한다.
   - Demo 또는 Client 용 리포지토리/프로젝트에서만 해당 키들을 설정하고 결제 기능을 활성화한다.
   - AI 도구는 템플릿 리포/프로젝트에서 PG 키를 생성·수정하는 작업을 수행하지 않는다.

## 5. AI 작업 프롬프트 템플릿 (안티그래비티/커서/코파일럿 공용)

이 블록을 그대로 복사해서, 상점 하나 새로 세팅할 때 사용할 수 있다.

```markdown
[ROLE]
너는 KS컴퍼니에서 운영하는 "단일 상점 배달앱 템플릿"의
DevOps + 풀스택 시니어 개발자 역할이다.

[CONTEXT]
- 이 리포지토리는 템플릿에서 복제된 "특정 상점용 배달앱"이다.
- 공통 규칙:
  - Firestore/Storage/Functions 스키마 및 Security Rules는
    템플릿과 동일한 구조를 사용한다.
  - 상점별로 다른 것은:
    - Firebase Project ID
    - .env 내 Firebase Web Config
    - 결제(NicePay) Client ID / Secret Key
    - 도메인(URL)
- 클라이언트(점주)는 코드/배포를 수정하지 않고,
  /admin 화면에서 상점 설정/메뉴/쿠폰/이벤트만 관리한다.
- 초기 상태에서는 stores/menus/orders/reviews 컬렉션을 비우고 시작한다.
  이 상태는 "버그"가 아니라 "초기 세팅 전 상태"다.

[TASK]
1) 새 상점용 Firebase 프로젝트와 이 리포지토리를 연결하기 위한 작업을 정리하고,
   필요한 경우 설정 파일(.firebaserc, .env 등)을 수정해라.

2) Security Rules, Firestore 인덱스, Functions 구조는
   템플릿과 동일하게 유지하되, 프로젝트 ID 또는 하드코딩된 이메일/UID가 있다면
   이를 제거하거나 환경변수/컬렉션 기반 권한으로 정리해라.

3) "초기 세팅 플로우"를 보장하는 코드를 검토해라.
   - 관리자가 로그인했는데 stores 컬렉션에 해당 storeId 문서가 없으면
     /admin/store-setup 페이지로 리다이렉트 되는지 확인하고,
     그렇지 않다면 그 흐름을 구현해라.
   - 고객 앱에서는 상점이 없을 때 "준비 중" 안내 화면만 보이도록 유지해라.

4) Firestore/Storage 데이터를 "초기 상태"로 만드는 스크립트 또는 가이드를
   코드 또는 문서 형태로 정리해라.
   - 테스트 데이터 삭제
   - 점주용 관리자 계정 1개 생성 또는 준비

5) 최종적으로, 이 상점 리포지토리가
   "백엔드는 완전히 연결되어 있고, 프론트와 데이터는 초기 상태인 템플릿 복제본"
   이 되도록 설정을 마무리해라.

[CONSTRAINTS]
- Security Rules/Schema 구조를 상점별로 다르게 만들지 말 것.
- 상점이 여러 개 필요해도, 이 리포지토리는 "단일 상점" 기준으로만 운영한다.
- 심각한 보안/구조 변경은 항상 템플릿 리포에서 먼저 수행한 뒤
  여기로 반영하는 방식으로만 진행한다.

[OUTPUT]
- 수정한 파일 목록과 변경 요약
- Firebase에 배포할 때 사용할 명령어 리스트
- 점주에게 전달할 정보(관리자 URL, 계정, 초기 세팅 순서)를 정리한 요약 문단
```
