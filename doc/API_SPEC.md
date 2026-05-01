# 영업 일일 보고 시스템 API 명세서

## 공통 사항

### Base URL
```
/api/v1
```

### 인증
모든 API는 JWT Bearer 토큰 인증을 사용합니다.

```
Authorization: Bearer <token>
```

로그인 API(`POST /auth/login`)는 인증 불필요.

### 공통 응답 형식

**성공**
```json
{
  "success": true,
  "data": { ... }
}
```

**목록 조회 (페이징)**
```json
{
  "success": true,
  "data": {
    "items": [ ... ],
    "total": 100,
    "page": 1,
    "pageSize": 20
  }
}
```

**실패**
```json
{
  "success": false,
  "error": {
    "code": "VALIDATION_ERROR",
    "message": "필드 유효성 검사 실패",
    "details": [ ... ]
  }
}
```

### 공통 HTTP 상태 코드

| 코드 | 설명 |
|---|---|
| 200 | 성공 |
| 201 | 생성 성공 |
| 400 | 요청 파라미터 오류 |
| 401 | 인증 실패 (토큰 없음 또는 만료) |
| 403 | 권한 없음 |
| 404 | 리소스 없음 |
| 409 | 충돌 (중복 등) |
| 500 | 서버 내부 오류 |

### 권한 역할

| 역할 | 설명 |
|---|---|
| `rep` | 영업 사원 |
| `manager` | 상급자 |
| `admin` | 시스템 관리자 |

---

## 1. 인증 (Auth)

### 1.1 로그인

```
POST /auth/login
```

**Request Body**
```json
{
  "email": "hong@example.com",
  "password": "password123"
}
```

**Response 200**
```json
{
  "success": true,
  "data": {
    "accessToken": "eyJhbGciOiJIUzI1NiIs...",
    "tokenType": "Bearer",
    "expiresIn": 86400,
    "user": {
      "id": 1,
      "name": "홍길동",
      "email": "hong@example.com",
      "role": "rep"
    }
  }
}
```

**Response 401**
```json
{
  "success": false,
  "error": {
    "code": "INVALID_CREDENTIALS",
    "message": "이메일 또는 비밀번호가 올바르지 않습니다."
  }
}
```

---

### 1.2 로그아웃

```
POST /auth/logout
```

**Response 200**
```json
{
  "success": true,
  "data": null
}
```

---

### 1.3 비밀번호 변경

```
PATCH /auth/password
```

**권한** 로그인 사용자 본인

**Request Body**
```json
{
  "currentPassword": "oldpassword",
  "newPassword": "newpassword123"
}
```

**Response 200**
```json
{
  "success": true,
  "data": null
}
```

---

## 2. 일일 보고서 (Daily Reports)

### 2.1 보고서 목록 조회

```
GET /reports
```

**권한** `rep` (본인 보고서만), `manager` · `admin` (팀 전체)

**Query Parameters**

| 파라미터 | 타입 | 필수 | 설명 |
|---|---|---|---|
| startDate | date (YYYY-MM-DD) | N | 조회 시작일, 기본값: 이번 달 1일 |
| endDate | date (YYYY-MM-DD) | N | 조회 종료일, 기본값: 오늘 |
| salesRepId | integer | N | 영업 사원 ID (manager·admin만 사용 가능) |
| status | string | N | `draft` / `submitted` / `reviewed` |
| page | integer | N | 페이지 번호, 기본값: 1 |
| pageSize | integer | N | 페이지 크기, 기본값: 20, 최대: 100 |

**Response 200**
```json
{
  "success": true,
  "data": {
    "items": [
      {
        "id": 10,
        "reportDate": "2026-05-01",
        "salesRep": {
          "id": 1,
          "name": "홍길동"
        },
        "visitCount": 3,
        "status": "submitted",
        "submittedAt": "2026-05-01T18:00:00Z",
        "createdAt": "2026-05-01T09:00:00Z"
      }
    ],
    "total": 30,
    "page": 1,
    "pageSize": 20
  }
}
```

---

### 2.2 보고서 단건 조회

```
GET /reports/:id
```

**권한** `rep` (본인), `manager` · `admin` (전체)

**Response 200**
```json
{
  "success": true,
  "data": {
    "id": 10,
    "reportDate": "2026-05-01",
    "salesRep": {
      "id": 1,
      "name": "홍길동"
    },
    "status": "submitted",
    "problem": "ABC사 견적 마감 촉박. 결재 라인 확인 필요.",
    "plan": "오전: ABC사 후속 방문 / 오후: XYZ 클레임 처리 확인",
    "visitRecords": [
      {
        "id": 101,
        "customer": {
          "id": 5,
          "companyName": "(주)ABC"
        },
        "visitType": "visit",
        "purpose": "제안서 전달",
        "content": "신규 솔루션 제안서 전달 및 설명",
        "result": "2차 미팅 요청 수락",
        "nextAction": "다음 주 화요일 2차 미팅 일정 확정",
        "visitedAt": "10:30",
        "createdAt": "2026-05-01T11:00:00Z"
      }
    ],
    "comments": [
      {
        "id": 201,
        "targetSection": "problem",
        "author": {
          "id": 2,
          "name": "김팀장"
        },
        "content": "견적 마감일 공유해 주세요. 내일 회의에서 논의합니다.",
        "createdAt": "2026-05-01T18:30:00Z",
        "updatedAt": "2026-05-01T18:30:00Z"
      }
    ],
    "submittedAt": "2026-05-01T18:00:00Z",
    "reviewedAt": null,
    "createdAt": "2026-05-01T09:00:00Z",
    "updatedAt": "2026-05-01T18:00:00Z"
  }
}
```

---

### 2.3 보고서 생성

```
POST /reports
```

**권한** `rep`

**Request Body**
```json
{
  "reportDate": "2026-05-01",
  "problem": "ABC사 견적 마감 촉박. 결재 라인 확인 필요.",
  "plan": "오전: ABC사 후속 방문 / 오후: XYZ 클레임 처리 확인",
  "visitRecords": [
    {
      "customerId": 5,
      "visitType": "visit",
      "purpose": "제안서 전달",
      "content": "신규 솔루션 제안서 전달 및 설명",
      "result": "2차 미팅 요청 수락",
      "nextAction": "다음 주 화요일 2차 미팅 일정 확정",
      "visitedAt": "10:30"
    }
  ]
}
```

**Validation**
- `reportDate` 필수
- `visitRecords[].customerId` 필수
- `visitRecords[].visitType` 필수: `visit` / `call` / `video` / `email`
- `visitRecords[].purpose` 필수
- `visitRecords[].content` 필수
- 동일 날짜 보고서 중복 불가

**Response 201**
```json
{
  "success": true,
  "data": {
    "id": 10,
    "reportDate": "2026-05-01",
    "status": "draft",
    "createdAt": "2026-05-01T09:00:00Z"
  }
}
```

**Response 409** (같은 날짜 보고서 이미 존재)
```json
{
  "success": false,
  "error": {
    "code": "DUPLICATE_REPORT",
    "message": "해당 날짜의 보고서가 이미 존재합니다."
  }
}
```

---

### 2.4 보고서 수정

```
PUT /reports/:id
```

**권한** `rep` (본인, `draft` 상태만)

**Request Body** — 2.3 생성과 동일 구조

**Response 200**
```json
{
  "success": true,
  "data": {
    "id": 10,
    "status": "draft",
    "updatedAt": "2026-05-01T10:00:00Z"
  }
}
```

**Response 403** (제출·확인 상태에서 수정 시도)
```json
{
  "success": false,
  "error": {
    "code": "NOT_EDITABLE",
    "message": "제출된 보고서는 수정할 수 없습니다."
  }
}
```

---

### 2.5 보고서 제출

```
PATCH /reports/:id/submit
```

**권한** `rep` (본인, `draft` 상태만)

**Response 200**
```json
{
  "success": true,
  "data": {
    "id": 10,
    "status": "submitted",
    "submittedAt": "2026-05-01T18:00:00Z"
  }
}
```

---

### 2.6 보고서 확인 완료

```
PATCH /reports/:id/review
```

**권한** `manager` · `admin` (`submitted` 상태만)

**Response 200**
```json
{
  "success": true,
  "data": {
    "id": 10,
    "status": "reviewed",
    "reviewedAt": "2026-05-01T19:00:00Z"
  }
}
```

---

## 3. 방문 기록 (Visit Records)

### 3.1 방문 기록 추가

```
POST /reports/:reportId/visits
```

**권한** `rep` (본인 보고서, `draft` 상태만)

**Request Body**
```json
{
  "customerId": 5,
  "visitType": "call",
  "purpose": "클레임 처리 확인",
  "content": "고객 불만 사항 청취 및 처리 일정 안내",
  "result": "다음 주 내 처리 완료 약속",
  "nextAction": "처리 완료 후 결과 보고",
  "visitedAt": "14:00"
}
```

**Response 201**
```json
{
  "success": true,
  "data": {
    "id": 102,
    "reportId": 10,
    "customer": {
      "id": 5,
      "companyName": "(주)ABC"
    },
    "visitType": "call",
    "purpose": "클레임 처리 확인",
    "content": "고객 불만 사항 청취 및 처리 일정 안내",
    "result": "다음 주 내 처리 완료 약속",
    "nextAction": "처리 완료 후 결과 보고",
    "visitedAt": "14:00",
    "createdAt": "2026-05-01T14:10:00Z"
  }
}
```

---

### 3.2 방문 기록 수정

```
PUT /reports/:reportId/visits/:visitId
```

**권한** `rep` (본인 보고서, `draft` 상태만)

**Request Body** — 3.1 추가와 동일 구조

**Response 200**
```json
{
  "success": true,
  "data": {
    "id": 102,
    "updatedAt": "2026-05-01T14:30:00Z"
  }
}
```

---

### 3.3 방문 기록 삭제

```
DELETE /reports/:reportId/visits/:visitId
```

**권한** `rep` (본인 보고서, `draft` 상태만)

**Response 200**
```json
{
  "success": true,
  "data": null
}
```

---

## 4. 댓글 (Comments)

### 4.1 댓글 목록 조회

```
GET /reports/:reportId/comments
```

**권한** 전체

**Query Parameters**

| 파라미터 | 타입 | 필수 | 설명 |
|---|---|---|---|
| targetSection | string | N | `problem` / `plan` — 미입력 시 전체 반환 |

**Response 200**
```json
{
  "success": true,
  "data": {
    "items": [
      {
        "id": 201,
        "targetSection": "problem",
        "author": {
          "id": 2,
          "name": "김팀장"
        },
        "content": "견적 마감일 공유해 주세요. 내일 회의에서 논의합니다.",
        "createdAt": "2026-05-01T18:30:00Z",
        "updatedAt": "2026-05-01T18:30:00Z"
      }
    ],
    "total": 1
  }
}
```

---

### 4.2 댓글 작성

```
POST /reports/:reportId/comments
```

**권한** `manager` · `admin`

**Request Body**
```json
{
  "targetSection": "problem",
  "content": "견적 마감일 공유해 주세요. 내일 회의에서 논의합니다."
}
```

**Validation**
- `targetSection` 필수: `problem` / `plan`
- `content` 필수, 최소 1자

**Response 201**
```json
{
  "success": true,
  "data": {
    "id": 201,
    "reportId": 10,
    "targetSection": "problem",
    "author": {
      "id": 2,
      "name": "김팀장"
    },
    "content": "견적 마감일 공유해 주세요. 내일 회의에서 논의합니다.",
    "createdAt": "2026-05-01T18:30:00Z"
  }
}
```

---

### 4.3 댓글 수정

```
PUT /reports/:reportId/comments/:commentId
```

**권한** `manager` · `admin` (본인 댓글만)

**Request Body**
```json
{
  "content": "수정된 댓글 내용입니다."
}
```

**Response 200**
```json
{
  "success": true,
  "data": {
    "id": 201,
    "content": "수정된 댓글 내용입니다.",
    "updatedAt": "2026-05-01T19:00:00Z"
  }
}
```

---

### 4.4 댓글 삭제

```
DELETE /reports/:reportId/comments/:commentId
```

**권한** `manager` · `admin` (본인 댓글), `admin` (전체)

**Response 200**
```json
{
  "success": true,
  "data": null
}
```

---

## 5. 고객 마스터 (Customers)

### 5.1 고객 목록 조회

```
GET /customers
```

**권한** 전체

**Query Parameters**

| 파라미터 | 타입 | 필수 | 설명 |
|---|---|---|---|
| search | string | N | 회사명·담당자명 부분 검색 |
| grade | string | N | `A` / `B` / `C` |
| isActive | boolean | N | 기본값: `true` |
| page | integer | N | 기본값: 1 |
| pageSize | integer | N | 기본값: 20 |

**Response 200**
```json
{
  "success": true,
  "data": {
    "items": [
      {
        "id": 5,
        "companyName": "(주)ABC",
        "contactName": "이담당",
        "contactPhone": "010-1234-5678",
        "contactEmail": "lee@abc.co.kr",
        "industry": "제조업",
        "grade": "A",
        "isActive": true,
        "createdAt": "2025-01-10T00:00:00Z"
      }
    ],
    "total": 50,
    "page": 1,
    "pageSize": 20
  }
}
```

---

### 5.2 고객 단건 조회

```
GET /customers/:id
```

**권한** 전체

**Response 200**
```json
{
  "success": true,
  "data": {
    "id": 5,
    "companyName": "(주)ABC",
    "contactName": "이담당",
    "contactPhone": "010-1234-5678",
    "contactEmail": "lee@abc.co.kr",
    "address": "서울시 강남구 ...",
    "industry": "제조업",
    "grade": "A",
    "isActive": true,
    "assignedSalesReps": [
      {
        "id": 1,
        "name": "홍길동"
      }
    ],
    "createdAt": "2025-01-10T00:00:00Z",
    "updatedAt": "2026-01-01T00:00:00Z"
  }
}
```

---

### 5.3 고객 등록

```
POST /customers
```

**권한** `admin`

**Request Body**
```json
{
  "companyName": "(주)ABC",
  "contactName": "이담당",
  "contactPhone": "010-1234-5678",
  "contactEmail": "lee@abc.co.kr",
  "address": "서울시 강남구 ...",
  "industry": "제조업",
  "grade": "A",
  "assignedSalesRepIds": [1, 3]
}
```

**Validation**
- `companyName` 필수
- `contactName` 필수
- `contactPhone` 필수, 전화번호 형식
- `grade` 필수: `A` / `B` / `C`

**Response 201**
```json
{
  "success": true,
  "data": {
    "id": 5,
    "companyName": "(주)ABC",
    "createdAt": "2026-05-01T09:00:00Z"
  }
}
```

---

### 5.4 고객 수정

```
PUT /customers/:id
```

**권한** `admin`

**Request Body** — 5.3 등록과 동일 구조 (모든 필드 선택적)

**Response 200**
```json
{
  "success": true,
  "data": {
    "id": 5,
    "updatedAt": "2026-05-01T10:00:00Z"
  }
}
```

---

### 5.5 고객 비활성화

```
PATCH /customers/:id/deactivate
```

**권한** `admin`

**Response 200**
```json
{
  "success": true,
  "data": {
    "id": 5,
    "isActive": false,
    "updatedAt": "2026-05-01T10:00:00Z"
  }
}
```

---

## 6. 영업 사원 마스터 (Sales Reps)

### 6.1 영업 사원 목록 조회

```
GET /sales-reps
```

**권한** `admin`

**Query Parameters**

| 파라미터 | 타입 | 필수 | 설명 |
|---|---|---|---|
| search | string | N | 이름·이메일 부분 검색 |
| role | string | N | `rep` / `manager` / `admin` |
| isActive | boolean | N | 기본값: `true` |
| page | integer | N | 기본값: 1 |
| pageSize | integer | N | 기본값: 20 |

**Response 200**
```json
{
  "success": true,
  "data": {
    "items": [
      {
        "id": 1,
        "name": "홍길동",
        "email": "hong@example.com",
        "phone": "010-1234-5678",
        "territory": "서울 북",
        "role": "rep",
        "isActive": true,
        "createdAt": "2025-01-01T00:00:00Z"
      }
    ],
    "total": 10,
    "page": 1,
    "pageSize": 20
  }
}
```

---

### 6.2 영업 사원 단건 조회

```
GET /sales-reps/:id
```

**권한** `admin`

**Response 200**
```json
{
  "success": true,
  "data": {
    "id": 1,
    "name": "홍길동",
    "email": "hong@example.com",
    "phone": "010-1234-5678",
    "territory": "서울 북",
    "role": "rep",
    "isActive": true,
    "assignedCustomers": [
      {
        "id": 5,
        "companyName": "(주)ABC",
        "grade": "A"
      }
    ],
    "createdAt": "2025-01-01T00:00:00Z",
    "updatedAt": "2026-01-01T00:00:00Z"
  }
}
```

---

### 6.3 영업 사원 등록

```
POST /sales-reps
```

**권한** `admin`

**Request Body**
```json
{
  "name": "홍길동",
  "email": "hong@example.com",
  "password": "temppass123",
  "phone": "010-1234-5678",
  "territory": "서울 북",
  "role": "rep",
  "assignedCustomerIds": [5, 6]
}
```

**Validation**
- `name` 필수
- `email` 필수, 이메일 형식, 중복 불가
- `password` 필수, 최소 8자
- `role` 필수: `rep` / `manager` / `admin`

**Response 201**
```json
{
  "success": true,
  "data": {
    "id": 1,
    "name": "홍길동",
    "email": "hong@example.com",
    "createdAt": "2026-05-01T09:00:00Z"
  }
}
```

---

### 6.4 영업 사원 수정

```
PUT /sales-reps/:id
```

**권한** `admin`

**Request Body** — `password` 제외, 나머지 6.3 등록과 동일 (모든 필드 선택적)

**Response 200**
```json
{
  "success": true,
  "data": {
    "id": 1,
    "updatedAt": "2026-05-01T10:00:00Z"
  }
}
```

---

### 6.5 영업 사원 비활성화

```
PATCH /sales-reps/:id/deactivate
```

**권한** `admin`

**Response 200**
```json
{
  "success": true,
  "data": {
    "id": 1,
    "isActive": false,
    "updatedAt": "2026-05-01T10:00:00Z"
  }
}
```

---

## 7. 알림 (Notifications)

### 7.1 알림 목록 조회

```
GET /notifications
```

**권한** 로그인 사용자 본인

**Query Parameters**

| 파라미터 | 타입 | 필수 | 설명 |
|---|---|---|---|
| isRead | boolean | N | 미입력 시 전체 반환 |
| page | integer | N | 기본값: 1 |
| pageSize | integer | N | 기본값: 20 |

**Response 200**
```json
{
  "success": true,
  "data": {
    "items": [
      {
        "id": 301,
        "type": "comment",
        "message": "김팀장님이 2026-05-01 보고서에 댓글을 남겼습니다.",
        "report": {
          "id": 10,
          "reportDate": "2026-05-01"
        },
        "comment": {
          "id": 201,
          "targetSection": "problem"
        },
        "isRead": false,
        "createdAt": "2026-05-01T18:30:00Z"
      }
    ],
    "total": 5,
    "unreadCount": 3,
    "page": 1,
    "pageSize": 20
  }
}
```

---

### 7.2 알림 읽음 처리

```
PATCH /notifications/:id/read
```

**권한** 로그인 사용자 본인

**Response 200**
```json
{
  "success": true,
  "data": {
    "id": 301,
    "isRead": true
  }
}
```

---

### 7.3 전체 알림 읽음 처리

```
PATCH /notifications/read-all
```

**권한** 로그인 사용자 본인

**Response 200**
```json
{
  "success": true,
  "data": {
    "updatedCount": 3
  }
}
```

---

## 8. 대시보드 (Dashboard)

### 8.1 대시보드 요약 조회

```
GET /dashboard/summary
```

**권한** 전체 (role에 따라 반환 데이터 범위 다름)

**Response 200 — rep**
```json
{
  "success": true,
  "data": {
    "todayReportStatus": "submitted",
    "monthlyVisitCount": 12,
    "recentReports": [
      {
        "id": 10,
        "reportDate": "2026-05-01",
        "status": "submitted",
        "visitCount": 3
      }
    ],
    "unreadNotificationCount": 3
  }
}
```

**Response 200 — manager · admin**
```json
{
  "success": true,
  "data": {
    "teamUnsubmittedCount": 2,
    "monthlyVisitCount": 87,
    "recentReports": [
      {
        "id": 10,
        "reportDate": "2026-05-01",
        "salesRep": { "id": 1, "name": "홍길동" },
        "status": "submitted",
        "visitCount": 3
      }
    ],
    "recentComments": [
      {
        "id": 201,
        "reportId": 10,
        "reportDate": "2026-05-01",
        "salesRep": { "id": 1, "name": "홍길동" },
        "content": "견적 마감일 공유해 주세요.",
        "createdAt": "2026-05-01T18:30:00Z"
      }
    ],
    "unreadNotificationCount": 0
  }
}
```

---

## API 엔드포인트 요약

| 메서드 | 엔드포인트 | 설명 | 권한 |
|---|---|---|---|
| POST | /auth/login | 로그인 | - |
| POST | /auth/logout | 로그아웃 | 전체 |
| PATCH | /auth/password | 비밀번호 변경 | 전체 |
| GET | /reports | 보고서 목록 조회 | 전체 |
| GET | /reports/:id | 보고서 단건 조회 | 전체 |
| POST | /reports | 보고서 생성 | rep |
| PUT | /reports/:id | 보고서 수정 | rep |
| PATCH | /reports/:id/submit | 보고서 제출 | rep |
| PATCH | /reports/:id/review | 보고서 확인 완료 | manager·admin |
| POST | /reports/:reportId/visits | 방문 기록 추가 | rep |
| PUT | /reports/:reportId/visits/:visitId | 방문 기록 수정 | rep |
| DELETE | /reports/:reportId/visits/:visitId | 방문 기록 삭제 | rep |
| GET | /reports/:reportId/comments | 댓글 목록 조회 | 전체 |
| POST | /reports/:reportId/comments | 댓글 작성 | manager·admin |
| PUT | /reports/:reportId/comments/:commentId | 댓글 수정 | manager·admin |
| DELETE | /reports/:reportId/comments/:commentId | 댓글 삭제 | manager·admin |
| GET | /customers | 고객 목록 조회 | 전체 |
| GET | /customers/:id | 고객 단건 조회 | 전체 |
| POST | /customers | 고객 등록 | admin |
| PUT | /customers/:id | 고객 수정 | admin |
| PATCH | /customers/:id/deactivate | 고객 비활성화 | admin |
| GET | /sales-reps | 영업 사원 목록 조회 | admin |
| GET | /sales-reps/:id | 영업 사원 단건 조회 | admin |
| POST | /sales-reps | 영업 사원 등록 | admin |
| PUT | /sales-reps/:id | 영업 사원 수정 | admin |
| PATCH | /sales-reps/:id/deactivate | 영업 사원 비활성화 | admin |
| GET | /notifications | 알림 목록 조회 | 전체 |
| PATCH | /notifications/:id/read | 알림 읽음 처리 | 전체 |
| PATCH | /notifications/read-all | 전체 알림 읽음 처리 | 전체 |
| GET | /dashboard/summary | 대시보드 요약 조회 | 전체 |
