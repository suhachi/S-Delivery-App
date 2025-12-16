# KS 심플배달앱 - 환경변수 & 결제 설정

**생성일**: 2025-12-10  
**목적**: 환경변수 템플릿 및 결제 키 사고 방지

---

## .env.template

**파일 위치**: 프로젝트 루트

```
# Firebase Configuration (Template Project)
# 템플릿 프로젝트의 기본값입니다.
# 실제 운영 시에는 클라이언트 프로젝트의 Config 값으로 교체해야 합니다.
VITE_FIREBASE_API_KEY=AIzaSyTemplateKeyReference
VITE_FIREBASE_AUTH_DOMAIN=ks-simple-delivery-template.firebaseapp.com
VITE_FIREBASE_PROJECT_ID=ks-simple-delivery-template
VITE_FIREBASE_STORAGE_BUCKET=ks-simple-delivery-template.firebasestorage.app
VITE_FIREBASE_MESSAGING_SENDER_ID=000000000000
VITE_FIREBASE_APP_ID=1:000000000000:web:template000000

# NicePay Configuration
# 템플릿 프로젝트에서는 결제 기능이 OFF 상태입니다.
# Demo 또는 Client 프로젝트에서 실제/샌드박스 Client ID를 설정하세요.
VITE_NICEPAY_CLIENT_ID=""
```

---

## ⚠️ 중요 사항

### 1. Firebase 설정

**템플릿 프로젝트**:
- 위 값들은 예시입니다
- 실제 Firebase 프로젝트의 Config 값으로 교체해야 합니다

**클라이언트 프로젝트 생성 시**:
1. Firebase Console에서 새 프로젝트 생성
2. 프로젝트 설정 > 일반 > 앱 추가 > 웹 앱
3. Config 값 복사
4. `.env` 파일 생성 (`.env.template` 복사)
5. 실제 Config 값으로 교체

### 2. NICEPAY 설정

**템플릿 프로젝트**:
- `VITE_NICEPAY_CLIENT_ID=""` (빈 문자열)
- 결제 기능이 비활성화되어 있습니다

**실제 결제 연동 시**:
1. NICEPAY 관리자 콘솔에서 Client ID 발급
2. `.env` 파일에 실제 Client ID 설정
3. **⚠️ 절대 실결제 키를 Git에 커밋하지 마세요**
4. `.env` 파일은 `.gitignore`에 포함되어 있습니다

**샌드박스 테스트**:
- NICEPAY 샌드박스 Client ID 사용 가능
- 실제 결제가 발생하지 않습니다

---

## .gitignore 확인

`.env` 파일이 Git에 커밋되지 않도록 확인:

```gitignore
# 환경 변수
.env
.env.local
.env.production
.env.development
```

---

## 환경변수 사용법

**프론트엔드 코드에서**:
```typescript
// Vite 환경변수는 import.meta.env로 접근
const apiKey = import.meta.env.VITE_FIREBASE_API_KEY;
const nicepayClientId = import.meta.env.VITE_NICEPAY_CLIENT_ID;
```

**주의**:
- `VITE_` 접두사가 붙은 변수만 클라이언트에서 접근 가능
- 서버 사이드 변수는 `VITE_` 접두사 없이 사용

---

## 결제 키 사고 방지 체크리스트

- [ ] `.env` 파일이 `.gitignore`에 포함되어 있는지 확인
- [ ] 템플릿 프로젝트의 `.env.template`에 실제 키가 없는지 확인
- [ ] 클라이언트 프로젝트 생성 시 `.env` 파일을 새로 생성
- [ ] 실결제 키는 운영 환경에서만 사용
- [ ] 개발/테스트 환경에서는 샌드박스 키 사용
- [ ] Git 히스토리에 실결제 키가 커밋되지 않았는지 확인

---

**다음 문서**: [KS-04-DEPLOYMENT-SAFETY.md](./KS-04-DEPLOYMENT-SAFETY.md)

