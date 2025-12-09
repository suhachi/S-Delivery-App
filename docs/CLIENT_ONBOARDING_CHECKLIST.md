# 클라이언트 온보딩 체크리스트 (단일 배달앱)

> 이 체크리스트는 새 상점(클라이언트)을 템플릿 기반으로 세팅할 때  
> KS컴퍼니 내부에서 따라야 할 절차입니다.

## 1. 사전 준비 (KS컴퍼니)

- [ ] 템플릿 리포지토리에서 새 리포지토리 생성
- [ ] 새 Firebase 프로젝트 생성 (ex: simple-delivery-<shop-name>)
- [ ] `.env`에 Firebase 설정값 입력
- [ ] `firebase deploy`로 Firestore Rules/Indexes, Hosting, Functions 배포
- [ ] 앱 하단/설정 화면에 개발사 정보 노출 확인  
      - 개발사: KS컴퍼니 / 대표: 석경선, 배종수 (공동대표)

## 2. 점주로부터 받을 정보

- [ ] 상호명
- [ ] 사업장 주소
- [ ] 대표 전화번호
- [ ] 영업시간 / 휴무일
- [ ] 최소 주문금액 / 배달비 정책
- [ ] 메뉴 목록 (카테고리 포함)
- [ ] 메뉴별 가격 / 설명 / 옵션 / 이미지
- [ ] 사용 예정 도메인 (예: delivery.myshop.com)

## 3. 데이터 입력 (KS컴퍼니)

- [ ] `stores/{storeId}` 문서 생성 (기본 상점 정보 입력)
- [ ] `stores/{storeId}/menus` 컬렉션 채우기
- [ ] 공지/이벤트 컬렉션 초기 상태 확인 (비어있음 또는 샘플 1개)

## 4. 결제/도메인 세팅

### 4-1. 점주 측 작업

- [ ] 나이스페이와 계약 완료
- [ ] NICEPAY Client ID / Secret Key 발급
- [ ] 발급된 키를 KS컴퍼니에 전달 (안전한 채널 사용)

### 4-2. KS컴퍼니 측 작업

- [ ] `.env` → `VITE_NICEPAY_CLIENT_ID` 설정
- [ ] `firebase functions:config:set nicepay.secret_key="..."` 적용
- [ ] Functions 재배포 (`firebase deploy --only functions`)
- [ ] Firebase Hosting에 커스텀 도메인 연결
- [ ] HTTPS/리다이렉트 동작 확인

## 5. 최종 QA 및 인계

- [ ] 테스트 주문 → 결제 → 주문내역/관리자화면 플로우 점검
- [ ] 관리자 `/admin` 접속하여 공지/이벤트/메뉴 수정 테스트
- [ ] 점주에게 관리자 계정/접속 방법 안내
- [ ] 점주에게 “나이스페이 키 변경/도메인 변경 요청 시 연락 채널” 안내

---

**담당자 메모:**

- 개발사: KS컴퍼니  
- 대표: 석경선, 배종수 (공동대표)  
- 이 템플릿은 여러 상점에 복제 사용 가능하며,  
  각 상점별로 Firebase 프로젝트 / 나이스페이 키 / 도메인만 분리 관리한다.
