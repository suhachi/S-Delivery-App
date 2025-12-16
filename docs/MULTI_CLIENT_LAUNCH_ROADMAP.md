# 🚀 Multi-Client Launch Roadmap (Batch 1)

> **작성일**: 2025-12-13
> **목표**: 4개 상점(라이옥, 완미족발, 현풍닭칼국수, 하이오커피)의 앱을 **동시에** 복제하고 런칭한다.
> **전략**: `Template Clone` -> `Batch Config` -> `Batch Deploy` -> `Admin Data Injection`

---

## 1. 🎯 대상 상점 및 프로젝트 정의

관리의 용이성을 위해 **프로젝트 ID**와 **리포지토리명**을 아래와 같이 확정합니다.

| No | 상점명 (Display Name) | 프로젝트 ID (Firebase) | 리포지토리 폴더명 |
|:---:|:---|:---|:---|
| **1호** | **라이옥베트남쌀국수 (본점)** | `ryeoak-yangsan` | `simple-delivery-ryeoak` |
| **2호** | **완미족발 (양산범어점)** | `wanmi-yangsan` | `simple-delivery-wanmi` |
| **3호** | **현풍닭칼국수 (양산범어점)** | `hyunpung-yangsan` | `simple-delivery-hyunpung` |
| **4호** | **하이오커피 (양산범어점)** | `hio-yangsan` | `simple-delivery-hio` |

---

## 2. 🛣️ 실행 로드맵 (Execution Steps)

### Phase 1: 기반 준비 (Foundation)
*   [ ] **1-1. Root 폴더 정리**: `d:\projectsing\hyun-poong` 아래에 각 상점 폴더 생성.
*   [ ] **1-2. 템플릿 복제**: `simple-delivery-app` (v1.0.0) 소스를 4개 폴더로 각각 복사.
    *   `copy simple-delivery-app -> simple-delivery-ryeoak`
    *   `copy simple-delivery-app -> simple-delivery-wanmi`
    *   ... (반복)

### Phase 2: Firebase 프로젝트 생성 (Console)
*   [ ] **2-1. Firebase Console 접속**: `ryeoak-yangsan`, `wanmi-yangsan` 등 프로젝트 4개 신규 생성. (Blaze 요금제 설정 필요)
*   [ ] **2-2. 앱 등록**: 각 프로젝트에 웹 앱 등록 -> Firebase Config 확보.

### Phase 3: 개별 설정 적용 (Configuration)
각 상점 폴더로 이동하여 아래 설정 파일을 수정합니다.

#### 3-1. `.firebaserc` (Target Project)
```json
{ "projects": { "default": "[PROJECT_ID]" } }
```

#### 3-2. `.env` (Environment Variables)
```env
VITE_FIREBASE_PROJECT_ID=[PROJECT_ID]
VITE_FIREBASE_API_KEY=[API_KEY]
...
```

#### 3-3. `index.html` (Meta Info)
*   `<title>` 태그 수정: "라이옥베트남쌀국수", "완미족발" 등으로 변경.

### Phase 4: 배포 (Deployment)
*   [ ] **4-1. 의존성 설치**: `npm install` (각 폴더)
*   [ ] **4-2. 빌드**: `npm run build`
*   [ ] **4-3. 배포**: `firebase deploy` (Firestore Rules, Indexes, Hosting 등 전체 배포)

### Phase 5: 초기 데이터 주입 (Data Injection)
앱이 배포되면 **관리자(Admin)**로 접속하여 "가게 설정 마법사"를 건너뛰고, **직접 데이터를 주입**하거나 마법사를 통해 기본 정보를 입력합니다.

#### 5-1. 관리자 계정 생성 (Signup)
*   각 앱 URL (`https://[PROJECT_ID].web.app`) 접속
*   `/signup` 페이지 이동 -> `owner@[store].com` 계정 생성

#### 5-2. 가게 기본 정보 입력 (Store Info)
**[1호: 라이옥]**
*   이름: `라이옥베트남쌀국수`
*   주소: `경남 양산시 물금읍 화합길 12`
*   전화: `0507-1337-2819`
*   영업시간: `09:00 - 19:30` (월 휴무)

**[2호: 완미족발]**
*   이름: `완미족발 양산물금점`
*   주소: `경남 양산시 물금읍 범어리 2685-6` (도로명 교차 확인 필요)
*   전화: `0507-1372-2716`
*   영업시간: `16:00 - 24:00`

**[3호: 현풍닭칼국수]**
*   이름: `현풍닭칼국수 양산범어점`
*   주소: `경남 양산시 물금읍 청운로 345`
*   전화: `055-388-3303`
*   영업시간: `11:00 - 21:00`

**[4호: 하이오커피]**
*   이름: `하이오커피 양산범어점`
*   주소: `경남 양산시 물금읍 삽량로 40`
*   전화: `055-372-2781`
*   영업시간: `08:30 - 22:00`

---

## 3. ✅ 완료 기준 (Definition of Done)

1.  4개의 **개별적인 웹사이트 URL**이 정상 작동해야 한다.
2.  각 사이트 상단바에 **올바른 가게 이름**이 표시되어야 한다.
3.  관리자 페이지(`mypage` 또는 `store-settings`)에서 **기본 정보(주소, 전화번호)**가 입력되어 있어야 한다.
4.  결제 기능은 **OFF** 상태여야 한다. (추후 PG 계약 후 연동)

---

## 4. 📝 Next Step (User Action)
이 로드맵이 승인되면, **Phase 1 (폴더 생성 및 복제)** 작업을 즉시 시작합니다.
