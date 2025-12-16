# 프로젝트 마스터 스냅샷 v1.0.0 - 현재 배포/운영 상태

**생성일**: 2025-12-10  
**목적**: 템플릿 프로젝트의 현재 배포 상태 및 운영 정보 보관

---

## 1. 현재 운영 URL (배포된 도메인)

### 템플릿 프로젝트
- **Firebase Hosting URL**: `https://simple-delivery-app-9d347.web.app`
- **Firebase Hosting Custom Domain**: (미설정)
- **프로젝트 ID**: `simple-delivery-app-9d347`

---

## 2. Firebase 프로젝트 정보

### 템플릿 프로젝트
- **프로젝트 ID**: `simple-delivery-app-9d347`
- **프로젝트 번호**: (Firebase Console에서 확인 필요)
- **요금제**: Blaze (종량제)
- **리전**: asia-northeast3 (Seoul)

### 활성화된 서비스
- ✅ **Authentication**: Email/Password
- ✅ **Firestore Database**: 프로덕션 모드
- ✅ **Firebase Storage**: 활성화
- ✅ **Firebase Hosting**: 배포 완료
- ✅ **Cloud Functions**: Node.js 20, `nicepayConfirm` 함수 배포됨

---

## 3. 배포 명령어 히스토리

### 최종 배포 명령어

```bash
# 전체 배포
npm run firebase:deploy

# 또는 개별 배포
firebase deploy --only hosting
firebase deploy --only firestore:rules,firestore:indexes
firebase deploy --only storage
firebase deploy --only functions
```

### 배포 전 필수 체크

```bash
# 배포 전 안전 검증
npm run predeploy
# 또는
node scripts/check-deploy.mjs
```

---

## 4. Functions 환경 변수

### 현재 설정된 환경 변수

```bash
# Functions 환경 변수 확인
firebase functions:config:get

# NICEPAY Secret Key (설정 필요)
firebase functions:config:set nicepay.secret_key="YOUR_SECRET_KEY"
```

**주의**: 템플릿 프로젝트에서는 NICEPAY Secret Key가 설정되지 않았을 수 있습니다.  
클라이언트 프로젝트 생성 시 반드시 설정해야 합니다.

---

## 5. NICEPAY 설정

### Return URL
- **템플릿 프로젝트**: `https://simple-delivery-app-9d347.web.app/payment/nicepay/return`
- **또는**: `https://simple-delivery-app-9d347.web.app/nicepay/return`

**주의**: 클라이언트 프로젝트 생성 시 NICEPAY 관리자 콘솔에서 Return URL을 새 도메인으로 등록해야 합니다.

---

## 6. Firestore 인덱스 상태

모든 복합 인덱스가 배포되어 있습니다:
- `orders.status + createdAt`
- `orders.userId + createdAt`
- `orders.adminDeleted + createdAt`
- `orders.status + adminDeleted + createdAt`
- `reviews.status + createdAt`
- `notices.pinned + createdAt`
- `menus.category (array-contains) + createdAt`
- `events.active + startDate`
- `events.active + endDate`
- `coupons.isActive + createdAt`

---

## 7. 배포 체크리스트

### 배포 전 확인 사항
- [ ] Firebase 로그인 계정 확인 (`jsbae59@gmail.com`)
- [ ] `.firebaserc`의 프로젝트 ID 확인
- [ ] `.env` 파일의 Firebase Config 값 확인
- [ ] `npm run build` 실행하여 빌드 성공 확인
- [ ] `npm run predeploy` 실행하여 안전 검증 통과 확인

### 배포 후 확인 사항
- [ ] Hosting URL 접속 확인
- [ ] 관리자 페이지 접속 확인 (`/admin`)
- [ ] Functions 로그 확인 (`firebase functions:log`)
- [ ] Firestore Rules 배포 확인
- [ ] Storage Rules 배포 확인
- [ ] NICEPAY Return URL 등록 (결제 연동 시)

---

## 8. Git 정보

### 현재 브랜치
- **템플릿 브랜치**: `release/simple-delivery-template-v1.0.0`
- **태그**: `simple-delivery-v1.0.0`

### 리포지토리
- **원격 저장소**: `https://github.com/suhachi/simple-delivery-app.git`

---

## 9. 주요 배포 이슈 및 해결 내역

### 해결된 이슈
1. ✅ `package.json` 파일 손상 (마크다운 코드 블록 제거)
2. ✅ `firebase.json` hosting path 불일치 (`dist` → `build`)
3. ✅ Firestore 인덱스 형식 오류 (`arrayContains` → `arrayConfig: "CONTAINS"`)
4. ✅ Functions Node.js 런타임 버전 업그레이드 (18 → 20)
5. ✅ Functions TypeScript 컴파일 오류 (`skipLibCheck: true` 추가)
6. ✅ Functions ESLint 설정 누락 (`.eslintrc.js` 생성)
7. ✅ Legacy Functions 삭제 (8개 함수 수동 삭제)

### 참고 문서
- `DEPLOYMENT_PROCESS_REPORT.md`: 배포 과정 상세 로그
- `DEPLOYMENT_FINAL_REPORT.md`: 최종 배포 상태 보고서

---

## 10. 클라이언트 프로젝트 생성 시 변경 필요 사항

1. **`.firebaserc`**: 새 프로젝트 ID로 변경
2. **`.env`**: 새 Firebase 프로젝트의 Config 값으로 변경
3. **`scripts/check-deploy.mjs`**: `REQUIRED_ACCOUNT` 값 확인/변경
4. **NICEPAY Return URL**: NICEPAY 관리자 콘솔에 새 도메인 등록
5. **Functions 환경 변수**: `nicepay.secret_key` 설정

---

**참고**: 나머지 src 폴더의 파일들은 별도 MD 파일로 생성됩니다.
- `07-FRONTEND-SRC-CORE.md`: contexts, hooks, lib
- `08-FRONTEND-SRC-COMPONENTS.md`: components (전체)
- `09-FRONTEND-SRC-PAGES.md`: pages (전체)
- `10-FRONTEND-SRC-SERVICES.md`: services (전체)
- `11-FRONTEND-SRC-TYPES-UTILS.md`: types, utils, data, test


