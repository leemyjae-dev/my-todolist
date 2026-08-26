# my-todoList 실행 계획 (WBS)

## 버전 이력

| 버전 | 날짜 | 변경 내용 |
|---|---|---|
| 0.1 | 2026-08-26 | 최초 작성 (docs/1~7, schema.sql 기반) |

## 0. 개요

- 참조 문서: `1-domain-definition.md`(v0.3), `2-PRD.md`(v0.3), `3-user-scenario.md`(v0.2), `4-wireframe.md`(v0.1), `5-project-principle.md`(v0.2), `6-arch.md`(v0.2), `7-erd.md`(v0.1), `schema.sql`.
- 범위: PRD MVP **Must** 전 항목 + **Should**(내 정보 수정 UC-03, 카테고리 생성 UC-09) 포함. Could 항목(정렬 고도화, 다크모드)은 본 계획에서 제외.
- 진행 순서: DB → 백엔드 → 프론트엔드 순으로 선행 관계를 가지며, 같은 영역 내 Task는 최대한 독립적으로 병행 가능하도록 분할했다.
- Task ID 규칙: `DB-xx`(데이터베이스), `BE-xx`(백엔드), `FE-xx`(프론트엔드).

---

## 1. 데이터베이스 (DB)

### DB-01. PostgreSQL 17 로컬 환경 구성
- **수행 작업**: PostgreSQL 17 설치/실행 확인, `my_todolist` 데이터베이스 생성, 접속 계정 준비.
- **완료 조건**
  - [x] `psql`로 PostgreSQL 17 버전 접속 확인 (psql 미설치로 postgresql-mcp로 대체 검증: `PostgreSQL 17.11` 확인)
  - [x] `my_todolist` 데이터베이스 생성 완료
  - [x] 애플리케이션 접속용 계정/권한(CONNECT, CRUD) 부여 완료 (`postgres` 계정에 `GRANT ALL PRIVILEGES ON DATABASE my_todolist` 적용, 접속·쿼리 확인)
- **선행 Task**: 없음

### DB-02. 스키마 적용 (schema.sql 실행)
- **수행 작업**: `docs/schema.sql`을 대상 DB에 실행하여 `users`, `categories`, `todos` 테이블·제약·인덱스를 생성.
- **완료 조건**
  - [x] `schema.sql` 실행 오류 없이 완료 (`my_todolist` DB에 적용)
  - [x] `users`, `categories`, `todos` 3개 테이블 존재 확인 (`information_schema.tables` 조회로 대체 확인, psql 미설치)
  - [x] FK 제약(`categories.user_id`, `todos.user_id`, `todos.category_id`) 및 `CHECK(start_date <= end_date)` 적용 확인
  - [x] `UNIQUE(email)`, `UNIQUE(categories.user_id, name)` 제약 적용 확인
  - [x] 인덱스(`idx_categories_user_id`, `idx_todos_user_id`, `idx_todos_category_id`) 생성 확인
- **선행 Task**: DB-01

### DB-03. 접속 정보/환경변수 정리
- **수행 작업**: 백엔드에서 사용할 `DATABASE_URL`을 확정하고 `.env.example`에 반영(값 자체는 미포함).
- **완료 조건**
  - [x] `DATABASE_URL` 형식(호스트/포트/DB명/계정) 확정 (`postgresql://{user}:{password}@localhost:5432/my_todolist`)
  - [x] `.env.example`에 `DATABASE_URL` 키 추가(값은 placeholder)
- **선행 Task**: DB-01

### DB-04. 제약 조건 수동 검증
- **수행 작업**: 핵심 제약(중복 이메일, 카테고리 이름 중복, start_date>end_date)이 DB 레벨에서 실제로 거부되는지 SQL로 직접 검증.
- **완료 조건**
  - [x] 중복 이메일 INSERT 시 UNIQUE 위반 에러 확인 (`users_email_key`)
  - [x] 동일 사용자 내 중복 카테고리 이름 INSERT 시 UNIQUE 위반 에러 확인 (`categories_user_id_name_key`)
  - [x] `start_date > end_date`로 INSERT 시 CHECK 위반 에러 확인 (`todos_check`), 테스트 데이터는 검증 후 삭제 완료
- **선행 Task**: DB-02

---

## 2. 백엔드 (BE)

### BE-01. 프로젝트 초기화 및 디렉토리 뼈대 구성
- **수행 작업**: `backend/` 프로젝트 생성(Express, `pg`, `jsonwebtoken`, `bcrypt`, `dotenv`), `5-project-principle.md` 7절 기준 디렉토리(`src/db`, `src/modules`, `src/shared`, `src/middlewares`, `migrations`, `tests`) 생성.
- **완료 조건**
  - [ ] `package.json`에 Express/pg/jsonwebtoken/bcrypt/dotenv 의존성 등록
  - [ ] `5-project-principle.md` 7절과 동일한 디렉토리 구조 생성
  - [ ] `npm run dev`(또는 동등 명령)로 빈 서버 기동 확인
- **선행 Task**: 없음 (DB-01과 병행 가능)

### BE-02. DB Pool 모듈
- **수행 작업**: `src/db/pool.js`에 `pg.Pool` 싱글턴 생성(`max: 10~20`), 앱 시작 시 1회만 생성되도록 구현.
- **완료 조건**
  - [ ] `pool.js`가 `DATABASE_URL` 환경변수로 Pool 생성
  - [ ] 앱 재기동 없이 여러 요청에서 동일 Pool 인스턴스 재사용 확인(로그/디버그로 확인)
  - [ ] 간단한 `SELECT 1` 쿼리로 DB 연결 성공 확인
- **선행 Task**: BE-01, DB-02, DB-03

### BE-03. 인증 유틸 및 미들웨어 (JWT)
- **수행 작업**: `src/middlewares/auth.js`(access_token 검증), JWT 발급/검증 유틸(access 15m/refresh 7d), `src/middlewares/errorHandler.js`(공통 에러 응답 포맷 `{error:{code,message}}`).
- **완료 조건**
  - [ ] access_token/refresh_token 발급 함수 구현 및 단위 확인(만료시간 반영)
  - [ ] `auth.js` 미들웨어가 유효 토큰 통과, 미인증 요청 401 반환하는 것을 확인
  - [ ] `errorHandler`가 모든 라우트 에러를 동일 포맷으로 응답
- **선행 Task**: BE-01

### BE-04. 인증 API — 회원가입/로그인/토큰 재발급 (UC-01, UC-02)
- **수행 작업**: `modules/auth`에 회원가입(BR-02 기본 카테고리 자동 생성, BR-07 이메일 고유), 로그인(BR-01), 토큰 재발급 API 구현. `db/queries/user.queries.js`, `category.queries.js`에 필요한 쿼리 추가.
- **완료 조건**
  - [ ] `POST /auth/signup`: 이메일 중복 시 409, 비밀번호 8자 미만/이름 형식 오류 시 400
  - [ ] 회원가입 성공 시 User 레코드 + `isDefault=true` 카테고리 자동 생성 확인(BR-02)
  - [ ] `POST /auth/login`: 이메일/비밀번호 불일치 시 401(계정 존재 여부 비노출)
  - [ ] 로그인 성공 시 access_token+refresh_token 응답
  - [ ] `POST /auth/token/refresh`: 유효 refresh_token으로 access_token 재발급, 만료/무효 시 401
  - [ ] 비밀번호는 해시로만 저장(평문 미저장) 확인
- **선행 Task**: BE-02, BE-03

### BE-05. 사용자 정보 API — 내 정보 조회/수정 (UC-03, Should)
- **수행 작업**: `modules/user`에 본인 정보 조회/수정 API 구현(이름/비밀번호 변경, BR-05 본인만 수정 가능은 토큰의 sub로 자동 보장).
- **완료 조건**
  - [ ] `GET /users/me` 인증 사용자 정보 반환, 미인증 401
  - [ ] `PATCH /users/me` 이름/비밀번호 수정 성공 시 `updatedAt` 갱신
  - [ ] 비밀번호 미입력 시 기존 값 유지(변경 안 함)
  - [ ] 비밀번호 8자 미만/이름 형식 오류 시 400
- **선행 Task**: BE-03, BE-04

### BE-06. 카테고리 API — 생성/목록/삭제 (UC-08 Must, UC-09 Should)
- **수행 작업**: `modules/category`에 카테고리 생성(BR-09), 목록 조회, 삭제(BR-08: 기본 카테고리 삭제 금지, 삭제 시 소속 Todo를 기본 카테고리로 이동하는 트랜잭션) 구현. `db/queries/category.queries.js`, `todo.queries.js`(이동용 UPDATE) 확장.
- **완료 조건**
  - [ ] `POST /categories`: 이름 중복(동일 사용자 내) 시 409, 성공 시 `isDefault=false`로 생성
  - [ ] `GET /categories`: 본인 소유 카테고리만 반환
  - [ ] `DELETE /categories/:id`: 소유자 아니면 404(BR-05), `isDefault=true`이면 400(BR-08)
  - [ ] 일반 카테고리 삭제 시 소속 Todo의 `category_id`가 기본 카테고리로 일괄 이동(트랜잭션, 삭제 전/후 개수 일치 확인)
- **선행 Task**: BE-02, BE-03, BE-04

### BE-07. 할일 API — 등록/목록·필터/수정/삭제 (UC-04~UC-07)
- **수행 작업**: `modules/todo`에 CRUD API 구현. 등록 시 카테고리 미지정 시 기본 카테고리 적용(BR-03), `startDate<=endDate` 검증(BR-04), 소유권 검증(BR-05), 목록 조회 시 카테고리/상태 필터+페이지네이션(BR-06). `src/shared/todoStatus.js`에 상태 계산 함수(NOT_STARTED/IN_PROGRESS/OVERDUE/COMPLETED, 서버 UTC 자정 기준, 도메인 정의서 4장) 구현.
- **완료 조건**
  - [ ] `POST /todos`: 카테고리 미지정 시 기본 카테고리로 생성(BR-03), `title` 미입력 400, `startDate>endDate` 400(BR-04)
  - [ ] 타 사용자 소유 `categoryId` 지정 시 404(BR-05)
  - [ ] `GET /todos`: 카테고리 필터, 상태 필터(시작전/진행중/완료/지연) 정상 동작, 응답에 계산된 상태 포함(BR-06)
  - [ ] `GET /todos`: `page`/`limit` 파라미터로 페이지네이션 동작
  - [ ] `PATCH /todos/:id`: 소유자 아니면 404(BR-05), `startDate>endDate` 400(BR-04), `isCompleted=true` 전환 시 `completedAt` 기록, `false` 복귀 시 초기화 후 상태 재계산
  - [ ] `DELETE /todos/:id`: 소유자 아니면 404, 성공 시 이후 조회에서 제외
  - [ ] 상태 계산 함수 단위 테스트(경계값: `startDate=today`, `endDate=today`) 통과
- **선행 Task**: BE-02, BE-03, BE-04, BE-06

### BE-08. 공통 소유권 검증 헬퍼 적용 (BR-05 전수 적용)
- **수행 작업**: `src/shared/notFoundIfEmpty.js` 헬퍼를 BE-05/06/07의 모든 조회·수정·삭제 API에 일괄 적용해 "내 것이 아니면 404" 규칙을 한 곳에서 관리.
- **완료 조건**
  - [ ] 카테고리/할일 관련 모든 Controller가 헬퍼를 통해 404 처리(개별 컨트롤러 중복 구현 없음)
  - [ ] 타 사용자 리소스 접근 시 모든 엔드포인트에서 동일하게 404 응답 확인
- **선행 Task**: BE-06, BE-07

### BE-09. 핵심 비즈니스 규칙 단위 테스트
- **수행 작업**: `tests/`에 `auth.service.test.js`(BR-01/02/07), `category.service.test.js`(BR-08/09), `todo.service.test.js`(BR-03/04/05/06 + 상태 계산) 작성.
- **완료 조건**
  - [ ] BR-04(`startDate<=endDate`) 위반 케이스 테스트 통과
  - [ ] BR-05(소유권 실패 시 404) 테스트 통과
  - [ ] BR-08(기본 카테고리 삭제 불가/Todo 이동) 테스트 통과
  - [ ] 상태 계산 경계값(시작일=오늘, 종료일=오늘, 완료 우선순위) 테스트 통과
  - [ ] 전체 테스트 스위트 `npm test` 성공
- **선행 Task**: BE-04, BE-06, BE-07

### BE-10. 서버 기동/배포 준비
- **수행 작업**: `.env.example` 최종 정리(PORT, DATABASE_URL, JWT_ACCESS_SECRET, JWT_REFRESH_SECRET, JWT_ACCESS_EXPIRES, JWT_REFRESH_EXPIRES), 헬스체크 엔드포인트(`GET /health`) 추가, 배포 환경에서 기동 확인.
- **완료 조건**
  - [ ] `.env.example`에 필요한 키 전부 명시(값은 placeholder)
  - [ ] `GET /health` 200 응답 확인
  - [ ] 배포 대상 환경에서 서버 정상 기동 및 DB 연결 확인
- **선행 Task**: BE-02, BE-09

---

## 3. 프론트엔드 (FE)

### FE-01. 프로젝트 초기화 및 FSD 뼈대 구성
- **수행 작업**: `frontend/` 프로젝트 생성(React 19 + TypeScript + Vite 등), Zustand/TanStack Query 설치, `5-project-principle.md` 6절 FSD 구조(`app/pages/widgets/features/entities/shared`)로 빈 디렉토리 생성.
- **완료 조건**
  - [ ] `package.json`에 react/react-dom(19), typescript, zustand, @tanstack/react-query 의존성 등록
  - [ ] FSD 6개 레이어 디렉토리 생성 완료
  - [ ] `npm run dev`로 빈 화면 정상 기동 확인
- **선행 Task**: 없음 (BE와 병행 가능)

### FE-02. API 클라이언트 및 QueryClient 설정
- **수행 작업**: `shared/api/apiClient.ts`(fetch 래퍼, `Authorization` 헤더 자동 첨부, 401 응답 시 refresh_token으로 재시도), `app/providers/queryClient.ts` 구성.
- **완료 조건**
  - [ ] `apiClient`가 access_token을 자동으로 헤더에 첨부
  - [ ] access_token 만료(401) 시 refresh 후 원 요청 1회 재시도 동작 확인
  - [ ] refresh도 실패 시 로그인 화면으로 리다이렉트되는 처리 존재
  - [ ] `QueryClientProvider`로 앱 전체 감싸짐
- **선행 Task**: FE-01, BE-04(연동 대상 API 존재)

### FE-03. 인증 feature — 회원가입/로그인 (S1, S2 / UC-01, UC-02)
- **수행 작업**: `features/auth`에 `SignupForm`, `LoginForm`, `authStore.ts`(Zustand: 로그인 사용자/토큰), `authApi.ts` 구현. `pages/signup`, `pages/login`에서 조합.
- **완료 조건**
  - [ ] 회원가입 폼: 이메일/비밀번호(8자+)/이름(1~50자) 유효성 검사 및 서버 오류(이메일 중복 등) 인라인 표시
  - [ ] 가입 성공 시 로그인 화면(S2)으로 이동
  - [ ] 로그인 폼: 인증 실패 시 공통 오류 문구 표시(계정 존재 여부 비노출)
  - [ ] 로그인 성공 시 토큰 저장 후 할일 목록(S3)으로 이동
  - [ ] 반응형: 데스크톱/모바일 모두 단일 컬럼 카드 레이아웃 확인
- **선행 Task**: FE-02, BE-04

### FE-04. 라우팅 및 인증 가드
- **수행 작업**: `app/App.tsx`에 라우터 구성(S1~S8 경로 매핑), 미인증 상태에서 보호 라우트 접근 시 로그인 화면으로 리다이렉트.
- **완료 조건**
  - [ ] 모든 화면(S1~S8) 경로가 라우터에 매핑됨
  - [ ] 미인증 상태로 S3~S8 접근 시 S2로 리다이렉트
  - [ ] 로그인 후 원래 목적지(또는 S3)로 정상 진입
- **선행 Task**: FE-03

### FE-05. 할일 목록/필터 화면 (S3, 홈 / UC-05)
- **수행 작업**: `entities/todo`(타입/`useTodos` 훅/`todoApi`), `entities/category`(목록 조회), `features/todo-filter`(카테고리/상태 필터, `filterStore.ts`), `widgets/todo-board`, `pages/todo-list`로 목록 화면 구현. 데스크톱(사이드바 필터)·모바일(드롭다운+FAB) 레이아웃 분기, 상태별 배지(색상+아이콘 이중 표현) 적용.
- **완료 조건**
  - [ ] 카테고리 필터(전체+사용자 카테고리) 선택 시 목록이 서버 필터 결과로 갱신
  - [ ] 상태 필터(전체/시작전/진행중/완료/지연) 선택 시 목록이 서버 필터 결과로 갱신
  - [ ] 각 항목에 상태 배지(색상+아이콘)와 카테고리 배지가 와이어프레임(S3) 대로 표시
  - [ ] 페이지네이션(이전/다음, 현재 페이지) 동작
  - [ ] 빈 목록 시 안내 문구 노출
  - [ ] 데스크톱(>=1024px) 사이드바 필터, 모바일(<768px) 드롭다운+FAB로 레이아웃 전환 확인
- **선행 Task**: FE-04, BE-07

### FE-06. 할일 등록/수정 폼 (S4, S5 / UC-04, UC-06)
- **수행 작업**: `features/todo-crud`에 `TodoForm`(등록/수정 공용), 캘린더 날짜 선택 UI(모바일은 bottom sheet), 카테고리 선택(미지정 시 "기본 카테고리 적용" 안내), 완료 여부 토글(수정 폼 전용) 구현. `pages/todo-form`에서 등록/수정 모드 분기.
- **완료 조건**
  - [ ] 시작일/종료일을 캘린더 UI로 선택 가능
  - [ ] `startDate>endDate` 입력 시 저장 전 클라이언트 유효성 오류 표시, 서버 400 응답도 동일하게 표시
  - [ ] 카테고리 미지정 시 "선택 안 함(기본 카테고리 적용)" 문구 노출
  - [ ] 저장 성공 시 목록(S3)으로 이동하고 신규/변경 항목 반영
  - [ ] 수정 폼에서 완료 체크 시 안내 문구(즉시 완료 전환/재계산) 노출
  - [ ] 모바일에서 캘린더가 bottom sheet 형태로 전환
- **선행 Task**: FE-05, BE-07

### FE-07. 삭제 확인 모달 (S6 / UC-07, UC-08)
- **수행 작업**: `shared/ui/ConfirmModal.tsx` 공용 모달 구현(대상 타입에 따라 문구 변경), 할일 삭제·카테고리 삭제 양쪽에서 재사용.
- **완료 조건**
  - [ ] 할일 삭제 시 "할일을 삭제하시겠습니까?" 문구와 대상 제목 표시
  - [ ] 카테고리 삭제 시 "소속 할일은 기본 카테고리로 이동합니다" 문구 표시
  - [ ] 배경 클릭/ESC로 취소 동작
  - [ ] 삭제 확정 시 목록이 즉시 갱신(재조회 또는 캐시 무효화)
- **선행 Task**: FE-05

### FE-08. 카테고리 관리 화면 (S7 / UC-08 Must, UC-09 Should)
- **수행 작업**: `features/category-crud`에 `CategoryForm`, `useCategoryMutations.ts` 구현. `pages/category`에서 목록/생성/삭제 조합.
- **완료 조건**
  - [ ] 카테고리 생성 폼: 이름 입력 후 추가, 중복 이름 시 인라인 오류(BR-09)
  - [ ] 목록에서 `isDefault=true` 카테고리는 "삭제 불가" 비활성 표시(BR-08)
  - [ ] 일반 카테고리 "삭제" 클릭 시 S6 모달 호출, 확정 시 삭제 후 목록 갱신 및 토스트 안내
- **선행 Task**: FE-07, BE-06

### FE-09. 내 정보 수정 화면 (S8, Should / UC-03)
- **수행 작업**: `pages/profile`에서 이름/비밀번호 수정 폼 구현(이메일은 읽기 전용).
- **완료 조건**
  - [ ] 이메일은 표시만 되고 입력 불가
  - [ ] 비밀번호 미입력 시 기존 값 유지, 입력 시 8자 미만 오류 표시
  - [ ] 저장 성공 시 완료 토스트 후 목록(S3)으로 복귀
- **선행 Task**: FE-04, BE-05

### FE-10. 반응형 QA 및 전체 네비게이션 통합 점검
- **수행 작업**: `4-wireframe.md`의 네비게이션 플로우 다이어그램 기준으로 S1~S8 전 화면 이동 경로와 데스크톱/모바일 반응형 레이아웃을 통합 점검.
- **완료 조건**
  - [ ] S1→S2→S3 및 S3→{S4,S5,S6,S7,S8}→S3 복귀 흐름이 와이어프레임과 동일하게 동작
  - [ ] 로그아웃 시 토큰 폐기 후 S2로 이동
  - [ ] 데스크톱(>=1024px)/모바일(<768px) 브레이크포인트에서 주요 화면(S3, S4) 레이아웃 붕괴 없음
  - [ ] 콘솔 에러 없이 전체 시나리오(3-user-scenario.md 시나리오 1~9) 수동 실행 완료
- **선행 Task**: FE-03, FE-05, FE-06, FE-07, FE-08, FE-09
