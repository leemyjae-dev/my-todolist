# my-todoList 아키텍처 다이어그램

## 버전 이력

| 버전 | 날짜 | 변경 내용 |
|---|---|---|
| 0.1 | 2026-08-26 | 최초 작성 (PRD v0.3, 프로젝트 구조 설계 원칙 v0.2 기반) |
| 0.2 | 2026-08-26 | JWT 인증 흐름도(4절) 추가 |

## 1. 전체 시스템 구성도

브라우저(React)가 Express API 서버와 REST로 통신하고, 서버는 PostgreSQL에 접근한다. 인증은 JWT(access/refresh) 기반이며 서버는 세션을 갖지 않는다.

```mermaid
flowchart LR
    Browser["브라우저<br/>React 19 + TS<br/>Zustand / TanStack Query"]
    API["Express API 서버<br/>(Node.js, stateless)"]
    DB[("PostgreSQL 17")]

    Browser -- "REST API 요청<br/>Authorization: Bearer access_token" --> API
    API -- "JSON 응답" --> Browser
    API -- "SQL (pg Pool)" --> DB
    DB -- "결과" --> API

    Browser -. "access_token 만료 시<br/>refresh_token으로 재발급 요청" .-> API
```

## 2. 백엔드 요청 처리 흐름

Route → Controller → Service(BR 검증) → Query(SQL) → pg Pool → DB 순으로 단방향으로 처리한다.

```mermaid
flowchart LR
    Route["Route<br/>URL/메서드 매핑, 인증 미들웨어"]
    Controller["Controller<br/>요청 파싱, 응답 포맷"]
    Service["Service<br/>BR 검증, 상태 계산"]
    Query["Query<br/>SQL + 파라미터 바인딩"]
    Pool["pg Pool"]
    DB[("PostgreSQL")]

    Route --> Controller --> Service --> Query --> Pool --> DB
    DB -.응답.-> Pool -.결과 객체.-> Query -.결과.-> Service -.결과.-> Controller -.JSON 응답.-> Route
```

## 3. 프론트엔드 레이어 구성 (FSD)

상위 레이어는 하위 레이어만 참조할 수 있다(역방향/동일 레이어 간 직접 참조 금지).

```mermaid
flowchart TD
    app --> pages --> widgets --> features --> entities --> shared
```

## 4. JWT 인증 흐름

로그인 시 access_token(단명)/refresh_token(장명)을 함께 발급하고, access_token 만료 시 refresh_token으로 재발급한다. refresh_token도 만료되면 재로그인한다.

```mermaid
sequenceDiagram
    participant B as 브라우저
    participant A as Express API
    participant D as PostgreSQL

    B->>A: POST /login (email, password)
    A->>D: 사용자 조회 + 비밀번호 검증
    D-->>A: 조회 결과
    A-->>B: access_token + refresh_token 발급

    B->>A: API 요청 (Authorization: Bearer access_token)
    A-->>B: 정상 응답

    B->>A: API 요청 (access_token 만료됨)
    A-->>B: 401 Unauthorized
    B->>A: POST /token/refresh (refresh_token)
    alt refresh_token 유효
        A-->>B: 새 access_token 발급
    else refresh_token 만료/무효
        A-->>B: 401 → 재로그인 요구
    end
```
