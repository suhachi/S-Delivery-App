# 화면설계서 (Screen Specification) – Simple Delivery App

---

## 1. 개요 (Overview)

### 1.1 표지 (Cover)

| 항목 | 내용 |
| :--- | :--- |
| **문서명** | **화면설계서 (Screen Specification) – Simple Delivery App** |
| **프로젝트명** | Simple Delivery App (Template v1.0) |
| **버전** | **v1.0** (Initial Release) |
| **작성일** | 2025-12-15 |
| **작성자** | **Anti-Gravity (AI Agent)** |
| **승인자** | **KS (Project Manager)** |
| **보안등급** | **Internal (Confidential)** |

### 1.2 개정이력 (History)

| 버전 | 일자 | 변경자 | 변경내용 (요약) | 승인자 |
| :---: | :---: | :---: | :--- | :---: |
| v0.1 | 2025-12-01 | Anti-Gravity | 초기 화면 목록 및 IA 수립 | KS |
| v0.9 | 2025-12-10 | Anti-Gravity | 주요 화면(주문, 관리자) 와이어프레임 상세 정의 | KS |
| **v1.0** | **2025-12-15** | **Anti-Gravity** | **전체 화면 기능 정의 및 데이터/권한 명세 확정** | **KS** |

---

## 2. IA / 메뉴 구조 (Information Architecture)

### 2.1 메뉴 구조도

*   **Customer (고객)**
    *   **Home (메인)**: `/` (가게 소개, 공지, 이벤트)
    *   **Menu (메뉴)**: `/menu` (카테고리별 메뉴 탐색)
    *   **Cart (장바구니)**: `/cart` (담은 메뉴 확인, 수량 조절)
    *   **Checkout (주문하기)**: `/checkout` (배송지 입력, 결제)
    *   **Orders (주문내역)**: `/orders` (실시간 상태, 과거 내역)
    *   **MyPage (마이페이지)**: `/mypage` (프로필, 리뷰 관리)
    *   **Login/Signup**: `/login`, `/signup`

*   **Admin (관리자)**
    *   **Dashboard**: `/admin` (오늘의 주문 통계)
    *   **Order Mgmt**: `/admin/orders` (주문 접수, 상태 변경)
    *   **Menu Mgmt**: `/admin/menus` (메뉴 CRUD)
    *   **Store Settings**: `/admin/store-settings` (가게 정보, 운영 시간)
    *   **Review/Notice/Event**: `/admin/...` (게시판 관리)

### 2.2 화면 목록 (Screen List)

| 화면ID | 화면명 | 메뉴경로 | 유형 | 권한 | 상태 |
| :--- | :--- | :--- | :---: | :---: | :---: |
| **CUST-HOME-001** | 환영/홈 | Home > Main | 조회 | 공통 | 확정 |
| **CUST-MENU-001** | 메뉴 목록 | Menu > List | 조회 | 공통 | 확정 |
| **CUST-MENU-002** | 메뉴 상세(팝업) | Menu > Detail | 상세 | 공통 | 확정 |
| **CUST-CART-001** | 장바구니 | Cart > View | 등록 | User | 확정 |
| **CUST-ORDER-001** | 주문/결제 | Order > Checkout | 등록 | User | 확정 |
| **CUST-LIST-001** | 주문 내역 | MyPage > Orders | 조회 | User | 확정 |
| **ADM-DASH-001** | 대시보드 | Admin > Main | 조회 | Admin | 확정 |
| **ADM-ORD-001** | 주문 접수 관리 | Admin > Orders | 수정 | Admin | 확정 |
| **ADM-SET-001** | 상점 설정 | Admin > Settings | 수정 | Admin | 확정 |

---

## 3. 화면 상세 정의 (Screen Details)

### #1. 메뉴 목록 화면 (CUST-MENU-001)

#### A. 상단 헤더 (Meta)
*   **Phase**: 개발완료
*   **Activity**: UI 구현
*   **System**: Customer App
*   **작성**: 2025-12-15 (Anti-Gravity)

#### B. 화면 정보
*   **화면ID**: `CUST-MENU-001`
*   **화면명**: 메뉴 목록 (Menu List)
*   **위치**: Customer > Menu
*   **유형**: 출력(List)
*   **개요**: 가게의 모든 메뉴를 카테고리 탭으로 구분하여 보여주고, 장바구니 담기 팝업을 호출한다.

#### C. 화면 와이어프레임 (Description)

**(이미지 영역: 메뉴 리스트 화면 예시)**
*   [1] 카테고리 탭 바 (Sticky)
*   [2] 메뉴 아이템 카드 (이미지 + 이름 + 가격)
*   [3] 장바구니 플로팅 버튼 (FAB)

#### D. 기능 정의 (Functional Specs)

| No | 기능명 | 상세 내용 (표준 템플릿) |
| :---: | :--- | :--- |
| **1** | **카테고리 탭** | **[표시]** `menus` 컬렉션의 `category` 필드를 집계하여 탭으로 나열 (예: 메인, 사이드, 음료)<br>**[트리거]** 탭 클릭<br>**[동작]** 해당 카테고리 메뉴 목록으로 스크롤 이동 또는 필터링<br>**[Data]** `menus` collection (Read)<br>**[비고]** `react-tabs` 또는 커스텀 탭 사용. |
| **2** | **메뉴 리스트** | **[표시]** 메뉴명, 가격, 설명(1줄), 썸네일 이미지, 품절 여부(Badge)<br>**[트리거]** 메뉴 카드 클릭<br>**[동작]** 메뉴 상세 팝업(`CUST-MENU-002`) 오픈<br>**[Data]** `menus` collection (Read)<br>**[AuthZ]** 누구나 조회 가능 |
| **3** | **장바구니 FAB** | **[표시]** 현재 담긴 총 금액 + 아이콘<br>**[트리거]** 버튼 클릭<br>**[동작]** 장바구니 화면(`CUST-CART-001`)으로 이동<br>**[노출조건]** 장바구니(`CartContext`)에 아이템이 1개 이상일 때만 노출 |

---

### #2. 주문/결제 화면 (CUST-ORDER-001)

#### A. 상단 헤더 (Meta)
*   **Phase**: 개발완료
*   **Activity**: UI 구현 & PG 연동
*   **System**: Customer App

#### B. 화면 정보
*   **화면ID**: `CUST-ORDER-001`
*   **화면명**: 주문 결제 (Checkout)
*   **위치**: Customer > Order > Checkout
*   **유형**: 등록(Input/Submit)
*   **개요**: 배송지 및 연락처를 입력하고 결제 수단을 선택하여 주문을 생성한다.

#### C. 화면 와이어프레임 (Description)

**(이미지 영역: 체크아웃 화면 예시)**
*   [1] 배송 정보 입력 폼 (주소, 상세주소, 연락처)
*   [2] 주문 내역 요약 (메뉴명 x 수량, 총액)
*   [3] 사장님 요청사항 (Textarea)
*   [4] 결제 수단 선택 (Radio: 앱결제 / 만나서 결제)
*   [5] 결제하기 버튼

#### D. 기능 정의 (Functional Specs)

| No | 기능명 | 상세 내용 (표준 템플릿) |
| :---: | :--- | :--- |
| **1** | **주소 검색** | **[트리거]** '주소 찾기' 버튼 클릭<br>**[동작]** Daum Postcode API 팝업 호출 -> 주소 선택 시 주소/우편번호 필드 자동 채움<br>**[Data]** `address`, `zipCode` (String)<br>**[검증]** 배달 가능 지역 아닐 시 경고 Toast 노출 |
| **2** | **주문 내역** | **[표시]** `CartContext`의 아이템 리스트 (읽기 전용)<br>**[표시]** 배달팁(`store.deliveryFee`)을 포함한 최종 결제 금액 계산 |
| **3** | **결제 수단** | **[입력]** `paymentMethod` (Enum: `card`, `meet`, `app`)<br>**[트리거]** '앱결제' 선택 시 PG사 결제 모듈 준비<br>**[비고]** 현재 `v1.0`에서는 PG 연동 OFF (기본값: 만나서 결제) |
| **4** | **주문 생성** | **[트리거]** '결제하기' 버튼 클릭<br>**[동작]**<br>1. 입력값 검증 (주소/연락처 필수)<br>2. Firestore `orders` 컬렉션에 문서 생성 (`status: 'pending'`)<br>3. 주문 완료 페이지로 이동<br>**[API]** `addOrder()` (Service Layer)<br>**[Error]** "재고가 부족합니다" 또는 "가게가 문을 닫았습니다" |

---

### #3. 관리자 주문 접수 화면 (ADM-ORD-001)

#### A. 상단 헤더 (Meta)
*   **Phase**: 개발완료
*   **Activity**: Admin 기능 구현
*   **System**: Admin App

#### B. 화면 정보
*   **화면ID**: `ADM-ORD-001`
*   **화면명**: 주문 관리 (Order Management)
*   **위치**: Admin > Orders
*   **유형**: 수정(Update/Control)
*   **개요**: 들어온 주문을 실시간으로 확인하고 상태(접수/거절/배달중/완료)를 변경한다.

#### C. 화면 와이어프레임 (Description)

**(이미지 영역: 주문 목록 보드)**
*   [1] 상태 필터 탭 (대기중 / 처리중 / 완료)
*   [2] 주문 카드 (메뉴, 주소, 요청사항, 시각)
*   [3] 상태 변경 버튼 그룹 (접수, 거절, 배달출발, 완료)
*   [4] 알림 ON/OFF 토글

#### D. 기능 정의 (Functional Specs)

| No | 기능명 | 상세 내용 (표준 템플릿) |
| :---: | :--- | :--- |
| **1** | **실시간 목록** | **[동작]** Firestore `onSnapshot` 리스너로 실시간 데이터 수신<br>**[표시]** 신규 주문 도착 시 화면 깜빡임 + 알림음(`notification.mp3`) 재생<br>**[Data]** `orders` (Query: `orderBy('createdAt', 'desc')`) |
| **2** | **상태 변경** | **[트리거]** '접수' 버튼 클릭<br>**[동작]** 해당 주문의 `status`를 `preparing`으로 업데이트 + 고객에게 푸시(미구현) 또는 상태 반영<br>**[API]** `updateOrderStatus(orderId, status)`<br>**[AuthZ]** Admin Only |
| **3** | **주문 거절** | **[트리거]** '거절' 버튼 클릭<br>**[동작]** 거절 사유 입력 팝업 -> 확인 시 `status: 'cancelled'` 업데이트<br>**[Data]** `cancelReason` (String) |

---

## 4. 데이터 모델 요약 (Entity Relationship)

*   **Store**: 가게 정보 (단일 문서)
*   **Menu**: 메뉴 아이템 (하위 컬렉션 아님, 루트 컬렉션 참조형 권장 또는 Store 하위) -> 현재 구조: `stores/{storeId}/menus/{menuId}`
*   **Order**: 주문 정보 (`orders` 컬렉션)
*   **User**: 고객 정보 (`users` 컬렉션)
*   **Review**: 리뷰 (`reviews` 컬렉션)

---

> **End of Screen Specification**
> *본 문서는 KS Simple Delivery App v1.0의 기능 명세 기준입니다.*
