# Firestore 인덱스 배포 가이드

이 문서는 프로젝트에서 사용되는 Firestore 복합 인덱스(Composite Indexes)의 정의 확인 및 배포 절차를 설명합니다.

## 1. 개요
Firestore에서 `where()`와 `orderBy()`를 함께 사용하거나, 여러 필드로 정렬하는 쿼리를 실행하려면 **복합 인덱스**가 필요합니다.
이 프로젝트의 인덱스 정의는 `src/firestore.indexes.json` 파일에서 관리됩니다.

## 2. 주요 인덱스 정의
현재(`src/firestore.indexes.json`) 정의된 주요 인덱스는 다음과 같습니다.

*   **Orders (주문)**
    *   `userId` (오름차순) + `createdAt` (내림차순): 내 주문 내역 조회
    *   `status` (오름차순) + `createdAt` (내림차순): 관리자 주문 상태별 조회
*   **Coupons (쿠폰)**
    *   `isActive` (오름차순) + `createdAt` (내림차순): 사용 가능한 쿠폰 조회
*   **Notices (공지사항)**
    *   `pinned` (내림차순) + `createdAt` (내림차순): 공지사항 목록 (고정글 우선)
    *   `category` (오름차순) + `createdAt` (내림차순): 카테고리별 공지
*   **Events (이벤트)**
    *   `active` (오름차순) + `startDate` (오름차순): 진행 중인 이벤트

## 3. 배포 절차

인덱스 정의가 변경되거나 누락된 경우, 다음 두 가지 방법 중 하나로 배포할 수 있습니다.

### 방법 A: Firebase CLI 사용 (권장)
로컬에 정의된 `firestore.indexes.json` 파일을 기준으로 인덱스를 배포합니다.

```bash
# 전체 Firestore 설정 배포 (규칙 + 인덱스)
firebase deploy --only firestore

# 인덱스만 별도 배포
firebase deploy --only firestore:indexes
```

### 방법 B: Firebase Console 사용 (자동 생성)
1.  앱 실행 중 "The query requires an index" 오류가 발생하면, 브라우저 콘솔(F12)을 엽니다.
2.  오류 메시지에 포함된 **긴 URL 링크**를 클릭합니다.
3.  Firebase Console로 이동하며, 필요한 인덱스 생성 화면이 자동으로 뜹니다.
4.  "Create index" 버튼을 클릭합니다. (생성까지 수 분 소요됨)

## 4. 트러블슈팅
*   **오류 메시지:** `FirebaseError: The query requires an index.`
*   **해결:** 위 방법 B를 사용하여 즉시 생성하거나, `src/firestore.indexes.json`에 해당 쿼리 조건을 추가한 뒤 CLI로 배포합니다.
*   **주의:** 인덱스 생성 중(Building 상태)에는 쿼리가 여전히 실패할 수 있습니다. 콘솔에서 상태가 'Enabled'로 바뀔 때까지 기다리세요.

## 5. 배포 직전 체크리스트
배포 전 다음 항목을 반드시 확인하세요.

*   [ ] `src/firestore.indexes.json` 파일이 최신 쿼리 로직(Service 코드)과 일치하는가?
*   [ ] `firebase deploy --only firestore:indexes` 명령을 실행했는가?
*   [ ] Firebase Console > Firestore > Indexes 탭에서 모든 인덱스 상태가 'Enabled'인가?
*   [ ] 주요 화면(주문내역, 공지사항 등)에서 인덱스 관련 에러 로그가 없는가?
