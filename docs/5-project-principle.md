# my-todoList 프로젝트 구조 설계 원칙

## 버전 이력

| 버전 | 날짜 | 변경 내용 |
|---|---|---|
| 0.1 | 2026-08-26 | 최초 작성 (도메인 정의서 v0.3, PRD v0.3 기반) |
| 0.2 | 2026-08-26 | 프론트엔드 디렉토리 구조를 FSD(Feature-Sliced Design) 패턴으로 변경 |

## 0. 문서 목적

- `1-domain-definition.md`(v0.3)의 엔티티/규칙(BR)/유스케이스(UC)와 `2-PRD.md`(v0.3)의 확정 기술 스택을 실제 코드 폴더/파일 구조로 매핑한다.
- 1인 개발·2일 MVP 제약을 반영해 실용적 수준으로만 규칙을 정한다. 이 문서에 없는 규칙은 "더 단순한 쪽"을 기본값으로 한다.

## 1. 최상위 원칙 (모든 스택 공통)

1. **단순성 우선**: 마이크로서비스, 헥사고날/클린 아키텍처, 별도 DI 컨테이너 등 2일 MVP에 불필요한 구조는 도입하지 않는다. 계층은 최소 단위(라우트→서비스→DB / UI→상태→API)로만 나눈다.
2. **관심사 분리**: "요청을 받는 것", "비즈니스 규칙을 판단하는 것", "데이터를 읽고 쓰는 것"은 항상 다른 파일/함수에 둔다. 한 함수가 이 셋을 동시에 하지 않는다.
3. **예측 가능한 구조**: 같은 종류의 파일은 같은 위치, 같은 이름 규칙을 따른다(예: 모든 API 훅은 `hooks/`, 모든 SQL은 `db/queries/`). 새 기능 추가 시 "어디에 파일을 만들지" 고민이 없어야 한다.
4. **도메인 규칙 추적성**: BR-01~09, UC-01~09를 구현하는 코드에는 해당 ID를 주석으로 남긴다(예: `// BR-04: startDate <= endDate`). 리뷰/디버깅 시 문서와 코드를 즉시 연결하기 위함이며, 별도 매핑 문서를 새로 만들지 않는다.
5. **YAGNI**: 향후 확장(공유, 알림, 반복 일정 등 Out of Scope)을 미리 대비한 추상화를 넣지 않는다. 필요해지면 그때 추가한다.

## 2. 의존성/레이어 원칙

### 2.1 공통 의존 방향

```
[화면/라우트] → [상태/비즈니스 규칙] → [데이터 접근] → [DB/외부 API]
```

- 상위 레이어는 하위 레이어를 호출할 수 있지만 역방향 호출은 금지한다(예: DB 접근 계층이 서비스 계층을 import하지 않는다).
- 같은 레이어끼리의 직접 참조는 최소화한다(예: 컨트롤러가 다른 컨트롤러를 직접 호출하지 않고, 공통 로직은 서비스로 내린다).

### 2.2 프론트엔드 레이어

| 레이어 | 역할 | 의존 대상 |
|---|---|---|
| UI (컴포넌트/페이지) | 화면 렌더링, 사용자 입력 처리 | 상태 레이어(Zustand store, TanStack Query 훅) |
| 서버 상태 (TanStack Query) | 서버 데이터 fetch/캐시/동기화(할일, 카테고리 목록 등) | API 클라이언트 |
| 전역 클라이언트 상태 (Zustand) | 로그인 사용자 정보, 필터 선택값 등 UI 전역 상태 | 없음(순수 상태) |
| API 클라이언트 | HTTP 요청 함수, 토큰 첨부/갱신 처리 | 없음(fetch/axios 래퍼) |

- 컴포넌트는 API 클라이언트를 직접 호출하지 않고 항상 TanStack Query 훅(`useTodos`, `useCreateTodo` 등)을 통해서만 서버 상태에 접근한다.
- Zustand는 서버 데이터 캐시 용도로 쓰지 않는다(TanStack Query와 역할 중복 금지). Zustand = 클라이언트 전역 상태, TanStack Query = 서버 상태.
- 위 4개 레이어를 실제 디렉토리로 어떻게 나누는지는 6절(FSD 구조) 참고. 레이어 표는 "역할 구분" 기준이고, 6절은 "파일 위치" 기준이다.

### 2.3 백엔드 레이어 (ORM 미사용 기준)

| 레이어 | 역할 | 의존 대상 |
|---|---|---|
| Route | URL/HTTP 메서드 매핑, 인증 미들웨어 연결 | Controller |
| Controller | 요청 파싱, 응답 포맷(성공/에러), 상태 코드 결정 | Service |
| Service | 비즈니스 규칙(BR-01~09) 검증, 상태(Status) 계산 | Query(DB 접근) 모듈 |
| Query (DB 접근) | SQL 문자열 + `pg` 파라미터 바인딩 실행, 결과를 JS 객체로 반환 | `pg` Pool |

- **SQL 격리 원칙**: ORM이 없으므로 SQL은 반드시 `db/queries/*.js`에만 존재한다. Controller/Route에서 직접 `pool.query(...)`를 호출하지 않는다. Service도 SQL 문자열을 직접 작성하지 않고 Query 모듈의 함수를 호출한다.
- 소유권 검증(BR-05)은 Query 단계에서 `WHERE id = $1 AND user_id = $2` 조건으로 처리하고, 결과가 없으면 Service/Controller가 일괄적으로 404를 반환한다(2.4절 참고).
- 트랜잭션이 필요한 경우(예: 카테고리 삭제 시 Todo 이동, BR-08)에만 Service에서 `pool.connect()`로 커넥션을 얻어 BEGIN/COMMIT을 명시적으로 관리하고, 단건 조회/수정은 Pool에 바로 위임한다.

## 3. 코드/네이밍 원칙

- **도메인 용어 = 코드 용어**: `User`, `Category`, `Todo`, `isDefault`, `isCompleted`, `startDate`, `endDate`, `completedAt` 등 도메인 정의서 3장의 필드명을 코드(변수/컬럼/DTO)에 그대로 사용한다. 임의 축약(`isDone`, `deadline` 등) 금지.
- **DB 컬럼은 snake_case, JS/TS 변수는 camelCase**: `user_id` ↔ `userId`처럼 Query 계층 경계에서만 변환한다(변환 로직도 `db/` 안에 둔다).
- **상태값**: 상태(Status)는 파생값이므로 `NOT_STARTED`, `IN_PROGRESS`, `OVERDUE`, `COMPLETED` 상수(도메인 정의서 4장 명칭)를 프론트/백엔드가 공유하는 하나의 상수 모듈로만 관리한다(중복 정의 금지).
- **파일명**: 기능 단위로 소문자-kebab 또는 도메인 단어 그대로 사용
  - 백엔드: `todo.routes.js`, `todo.controller.js`, `todo.service.js`, `todo.queries.js`
  - 프론트엔드: `TodoList.tsx`, `useTodos.ts`, `todoApi.ts`
- **함수명**: 동사+명사 조합, BR/UC와 1:1로 매칭되게 작성 (`createTodo`, `deleteCategoryAndMoveTodos`, `validateOwnership`, `computeTodoStatus`).
- 도메인 정의서 용어집(2장)과 다른 이름을 쓰고 싶다면 이 문서와 도메인 정의서를 함께 갱신한다.

## 4. 테스트/품질 원칙

- 전체 커버리지 수치를 강제하지 않는다. 대신 **핵심 비즈니스 규칙(BR-01~09)을 검증하는 단위 테스트**를 Service 레이어에 우선 작성한다.
  - 필수 대상 예: BR-04(startDate<=endDate 검증), BR-05(소유권 실패 시 404), BR-08(기본 카테고리 삭제 불가/Todo 이동), 상태 계산 로직(4장 규칙, 경계값: startDate=today, endDate=today).
  - Route/Controller, 프론트엔드 UI는 시간이 남을 때만 테스트하며 MVP 필수 항목이 아니다.
- 테스트 도구는 프로젝트에 이미 추가된 것을 사용(예: Node 진영은 `node:test` 또는 최소 설정의 Jest/Vitest 중 하나만 채택, 신규 의존성 최소화).
- **린트/포맷**: 백엔드/프론트엔드 각각 ESLint + Prettier 1세트만 사용, 규칙은 기본(recommended) 프리셋을 그대로 쓰고 커스터마이징은 최소화한다. 커밋 전 수동 실행으로 충분(pre-commit hook 등 별도 도구는 2일 일정상 생략).

## 5. 설정/보안/운영 원칙

- **환경변수**: `.env`(로컬, `.gitignore` 처리) + `.env.example`(키 목록만 공유)로 관리. 최소 항목: `DATABASE_URL`, `JWT_ACCESS_SECRET`, `JWT_REFRESH_SECRET`, `JWT_ACCESS_EXPIRES`(예: 15m), `JWT_REFRESH_EXPIRES`(예: 7d), `PORT`.
- **JWT**: access/refresh 시크릿은 서로 다른 값 사용, 코드에 하드코딩 금지. 토큰 발급/검증 로직은 `auth/` 또는 `middlewares/auth.js` 한 곳에만 둔다.
- **DB 커넥션 풀**: `pg.Pool`을 앱 시작 시 1회 생성해 싱글턴으로 재사용(`db/pool.js`). PRD 기준 `max: 10~20`. 요청마다 새 Pool/Client를 만들지 않는다.
- **SQL Injection 방지**: 모든 쿼리는 `$1, $2...` 파라미터 바인딩만 사용. 문자열 템플릿으로 값 조합 금지(Query 계층 코드 리뷰 시 필수 체크 항목).
- **소유권 검증(BR-05) 공통 처리**: 개별 컨트롤러마다 검증 로직을 작성하지 않는다. Query 함수 자체가 `user_id` 조건을 포함해 "내 것이 아니면 조회 결과 없음"을 보장하고, Controller는 결과 없음(`null`)을 공통 헬퍼(`notFoundIfEmpty` 등)로 404 응답 처리한다.
- **인증 미들웨어**: JWT 검증은 `middlewares/auth.js` 하나로 통일하고, 보호가 필요한 라우트에 일괄 적용한다(개별 컨트롤러에서 토큰 파싱 금지).
- **에러 응답 포맷 통일**: `{ error: { code, message } }` 형태로 단일 에러 핸들러(Express `errorHandler` 미들웨어)에서만 응답을 만든다.
- **로깅**: 요청 단위 최소 로그(메서드, 경로, 상태 코드, 응답 시간)만 남긴다. 별도 로그 수집 인프라(ELK 등)는 MVP 범위 밖.

## 6. 프론트엔드 디렉토리 구조 (React 19 + TS + Zustand + TanStack Query, FSD 패턴)

- FSD(Feature-Sliced Design)의 표준 레이어(`app → pages → widgets → features → entities → shared`)를 이 프로젝트(1인 개발, 2일 MVP, 화면 8개)에 맞게 실용적으로 적용한다. 모든 레이어에 6개 세그먼트(`ui/model/api/lib/config/types`)를 기계적으로 다 채우지 않고, 실제로 필요한 슬라이스만 만든다.
- **레이어 의존 방향**: 상위 레이어는 하위 레이어만 import할 수 있다(`app → pages → widgets → features → entities → shared`). 역방향 import(예: `entities`가 `features`를 참조) 및 같은 레이어 슬라이스 간 직접 참조(예: `features/todo-crud`가 `features/category-crud` 내부 파일을 직접 import)는 금지한다. 공통으로 쓰이는 로직은 반드시 `shared`나 더 하위 `entities`로 내린다.
- **entities**: 도메인 정의서(1-domain-definition.md v0.3)의 엔티티(User/Category/Todo)와 그 자체 상태만 담는다. CRUD API 훅/폼 등 "사용자 행위"는 features로 뺀다.
- **features**: 도메인 정의서의 유스케이스(UC-01~09)를 구현하는 "행위" 단위. 화면(pages)이 features를 조합해 완성된다.
- Zustand(전역 클라이언트 상태)는 각 슬라이스의 `model/*.store.ts`에, TanStack Query(서버 상태)는 각 슬라이스의 `model/use*.ts` 훅에 둔다. 역할 구분은 2.2절과 동일.

```
frontend/
├── src/
│   ├── app/                         # 앱 전역 설정 (FSD app 레이어)
│   │   ├── App.tsx                  # 라우터 정의, 전역 Provider 조합
│   │   ├── providers/
│   │   │   └── queryClient.ts       # TanStack QueryClient 설정
│   │   └── styles/                  # 반응형 레이아웃 공통 스타일
│   ├── pages/                       # 화면 단위 (wireframe S1~S8과 1:1 대응), features/widgets 조합만 담당
│   │   ├── signup/SignupPage.tsx    # UC-01
│   │   ├── login/LoginPage.tsx      # UC-02
│   │   ├── profile/ProfilePage.tsx  # UC-03 (Should)
│   │   ├── todo-list/TodoListPage.tsx   # UC-05 (S3 홈)
│   │   ├── todo-form/TodoFormPage.tsx   # UC-04/UC-06 등록·수정 공용
│   │   └── category/CategoryPage.tsx    # UC-08/UC-09
│   ├── widgets/                     # 여러 feature/entity를 조합한 화면 조각 (필요한 것만)
│   │   └── todo-board/
│   │       └── TodoBoard.tsx        # 목록 + 필터 + 항목을 묶은 S3 본문 (UC-05)
│   ├── features/                    # 유스케이스(행위) 단위, entities를 조합해 동작을 구현
│   │   ├── auth/                    # UC-01(회원가입), UC-02(로그인)
│   │   │   ├── ui/SignupForm.tsx
│   │   │   ├── ui/LoginForm.tsx
│   │   │   ├── model/authStore.ts       # Zustand: 로그인 사용자, access/refresh 토큰 상태
│   │   │   └── api/authApi.ts           # 로그인/회원가입/토큰 재발급 요청, BR-01/BR-02/BR-07
│   │   ├── todo-crud/                # UC-04(등록)/UC-06(수정)/UC-07(삭제)
│   │   │   ├── ui/TodoForm.tsx          # BR-04(startDate<=endDate) 입력 검증
│   │   │   ├── ui/DeleteTodoModal.tsx   # S6 삭제 확인 모달
│   │   │   └── model/useTodoMutations.ts # TanStack Query mutation 훅 (생성/수정/삭제)
│   │   ├── todo-filter/              # UC-05 목록 조회 시 필터/정렬
│   │   │   ├── ui/TodoFilter.tsx
│   │   │   └── model/filterStore.ts     # Zustand: 선택된 필터/정렬 상태 (서버 상태 아님)
│   │   └── category-crud/            # UC-08(등록/수정)/UC-09(삭제, BR-08/BR-09)
│   │       ├── ui/CategoryForm.tsx
│   │       └── model/useCategoryMutations.ts
│   ├── entities/                    # 도메인 엔티티 (도메인 정의서 3장 User/Category/Todo)
│   │   ├── user/
│   │   │   ├── model/user.types.ts      # User 필드 (도메인 정의서 3.1)
│   │   │   └── api/userApi.ts           # 내 정보 조회/수정, BR-05 소유권 전제
│   │   ├── category/
│   │   │   ├── model/category.types.ts  # Category, isDefault (도메인 정의서 3.2)
│   │   │   ├── model/useCategories.ts   # TanStack Query 훅 (목록 조회)
│   │   │   └── api/categoryApi.ts
│   │   └── todo/
│   │       ├── ui/TodoItem.tsx          # 단일 Todo 표시 (재사용 최소 단위)
│   │       ├── model/todo.types.ts      # Todo, Status 타입 (도메인 정의서 3.3, 4장 매핑)
│   │       ├── model/useTodos.ts        # TanStack Query 훅 (목록/단건 조회)
│   │       └── api/todoApi.ts           # fetch 함수 (CRUD)
│   └── shared/                      # 도메인과 무관한 공통 코드
│       ├── ui/ConfirmModal.tsx      # 범용 확인 모달 (category-crud 삭제 등에도 재사용)
│       ├── api/apiClient.ts         # fetch 래퍼: Authorization 헤더, 401 시 토큰 갱신
│       └── lib/todoStatus.ts        # 상태(Status) 계산 상수/함수 (4장 규칙, 백엔드와 동일 로직)
├── .env.example
└── package.json
```

- 세그먼트(`ui/model/api`)는 슬라이스 안에 실제로 파일이 있을 때만 만든다(빈 폴더/배럴 `index.ts` 강제 없음). ESLint FSD 플러그인 등 별도 도구 도입도 2일 일정상 생략하고, 레이어 규칙은 코드 리뷰(사실상 본인 셀프 체크)로만 지킨다.
- `widgets`는 이 프로젝트 규모상 꼭 필요한 경우(여러 feature 조합이 반복되는 화면)에만 만들고, 대부분의 화면은 `pages`가 `features`를 직접 조합해도 무방하다.

## 7. 백엔드 디렉토리 구조 (Node.js + Express + pg, ORM 미사용)

```
backend/
├── src/
│   ├── app.js                   # Express 앱 설정, 미들웨어/라우터 연결
│   ├── server.js                # 서버 실행 진입점
│   ├── db/
│   │   ├── pool.js              # pg.Pool 싱글턴 (커넥션 풀 설정)
│   │   └── queries/             # SQL은 이 디렉토리에만 작성 (ORM 대체 계층)
│   │       ├── user.queries.js
│   │       ├── category.queries.js
│   │       └── todo.queries.js
│   ├── modules/                 # 도메인 단위로 route/controller/service 묶음
│   │   ├── auth/
│   │   │   ├── auth.routes.js       # UC-01, UC-02
│   │   │   ├── auth.controller.js
│   │   │   └── auth.service.js      # BR-01, BR-02, BR-07 (해시, 기본 카테고리 생성)
│   │   ├── user/
│   │   │   ├── user.routes.js       # UC-03
│   │   │   ├── user.controller.js
│   │   │   └── user.service.js      # BR-05
│   │   ├── category/
│   │   │   ├── category.routes.js   # UC-08, UC-09
│   │   │   ├── category.controller.js
│   │   │   └── category.service.js  # BR-05, BR-08, BR-09
│   │   └── todo/
│   │       ├── todo.routes.js       # UC-04~UC-07
│   │       ├── todo.controller.js
│   │       └── todo.service.js      # BR-03, BR-04, BR-05, BR-06 + 상태 계산
│   ├── shared/
│   │   ├── todoStatus.js        # 상태(Status) 계산 함수 (4장 규칙, 프론트와 동일 로직 공유 참고용)
│   │   └── notFoundIfEmpty.js   # BR-05 공통 404 처리 헬퍼
│   ├── middlewares/
│   │   ├── auth.js              # JWT 검증 (access_token)
│   │   └── errorHandler.js      # 공통 에러 응답 포맷
│   └── migrations/              # SQL 마이그레이션 파일 (schema 생성/변경 이력)
│       ├── 001_create_users.sql
│       ├── 002_create_categories.sql
│       └── 003_create_todos.sql
├── tests/
│   ├── todo.service.test.js     # BR-04, BR-06, 상태 계산 검증
│   ├── category.service.test.js # BR-08, BR-09 검증
│   └── auth.service.test.js     # BR-01, BR-02, BR-07 검증
├── .env.example
└── package.json
```

- `db/queries/*.js`는 오직 SQL 실행과 결과 매핑(snake_case↔camelCase)만 담당하며 비즈니스 규칙 판단을 포함하지 않는다.
- `modules/*/**.service.js`가 유일하게 BR 규칙을 검증하는 위치이며, Controller/Route/Query는 규칙 판단 로직을 갖지 않는다.
