# NICEPAY 결제 연동 설정 가이드

본 프로젝트는 NICEPAY JS SDK(호출형)를 사용하여 결제를 연동합니다.

## 1. 사전 준비
- NICEPAY 상점아이디(MID) 및 키 발급 (현재 Sandbox 테스트 모드 사용 중)
- Sandbox Client ID: `S2_3c07255c2859427494511252a1015694`

## 2. 환경 변수 설정 (.env)
프론트엔드 환경 변수 (`.env`)에 다음 내용을 설정하세요.

```env
# NICEPAY Sandbox Client ID
VITE_NICEPAY_CLIENT_ID=S2_3c07255c2859427494511252a1015694

# Return URL (결제 완료 후 돌아올 주소)
# 로컬 개발 시: http://localhost:5173/payment/nicepay/return
# 배포 시: https://your-domain.com/payment/nicepay/return
VITE_NICEPAY_RETURN_URL=http://localhost:5173/payment/nicepay/return
```

## 3. Firebase Functions 설정 (서버 사이드)
결제 승인 API 호출을 위해 Secret Key를 Firebase Config에 등록해야 합니다.

### 로컬 테스트 시
`.runtimeconfig.json`을 `functions/` 디렉토리에 생성하거나, 에뮬레이터 설정을 사용하세요.

### 배포 시
터미널에서 다음 명령어를 실행하여 Secret Key를 설정합니다.

```bash
firebase functions:config:set nicepay.secret_key="<YOUR_NICEPAY_SECRET_KEY>"
```
(Sandbox Secret Key는 보안상 문서에 직접 기록하지 않음)

## 4. NICEPAY 관리자 콘솔 설정
NICEPAY 상점관리자 페이지에서 **승인 통보 URL** 또는 **Return URL** 설정이 필요한 경우 위 `VITE_NICEPAY_RETURN_URL`과 동일하게 등록합니다.
(JS 호출형의 경우 클라이언트에서 `returnUrl`을 파라미터로 넘기므로, 화이트리스트 등록이 필요할 수 있습니다.)

## 5. 결제 플로우 요약
1. 사용자가 `CheckoutPage`에서 "앱 결제" 선택
2. 주문이 `결제대기` 상태로 Firestore에 생성됨
3. `nicepayClient.ts`가 NICEPAY 결제창 호출
4. 사용자 인증 및 결제 진행
5. 결제 성공 시 `NicepayReturnPage`로 리다이렉트 (tid, authToken 등 포함)
6. `NicepayReturnPage`에서 Cloud Function `nicepayConfirm` 호출
7. Cloud Function이 NICEPAY 승인 API 호출 후 Firestore 주문 상태를 `결제완료`로 변경
8. 성공 시 `OrdersPage`로 이동
