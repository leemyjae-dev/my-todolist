# my-todoList 프론트엔드 스타일 가이드

## 버전 이력

| 버전 | 날짜 | 변경 내용 |
|---|---|---|
| 0.1 | 2026-08-27 | 최초 작성 (PRD v0.3, 와이어프레임 v0.1, 도메인 정의서 v0.3, 프로젝트 구조 설계 원칙 v0.3 기반) |
| 0.2 | 2026-08-27 | 다크모드 구현 완료 반영: 6절에 다크 테마 토큰 오버라이드 추가 |

## 0. 문서 목적 및 방향

- 와이어프레임(`4-wireframe.md`)에서 확정한 화면 구조(S1~S8)에 실제 색상·타이포그래피·컴포넌트 스타일을 입혀 개발 시 참고할 단일 기준을 제공한다.
- 참고 무드: 짙은 네이비 + 밝은 스카이블루 조합, 굵은 산세리프 타이틀, 둥근 카드/버튼, 넉넉한 여백. 단, 이 앱은 마케팅 랜딩 페이지가 아니라 매일 사용하는 실무형 할일관리 툴이므로 **배경은 라이트 테마를 기본으로 하고, 네이비/스카이블루는 헤더·버튼·강조 요소에만 포인트로 사용**한다(전면 다크 배경은 채택하지 않음 — 장시간 텍스트 응시 가독성, 리스트형 UI 특성 고려).
- 다크모드는 MVP 이후 PRD Could 항목으로 구현 완료됨. 라이트 테마가 기준(`:root`)이고, 다크 테마는 6절의 오버라이드 토큰만 정의한다(신규 토큰 추가 없이 기존 토큰 값만 교체).
- 과설계 금지: 토큰 수는 실제 8개 화면(S1~S8) 구현에 필요한 만큼만 정의한다. 별도 디자인 토큰 빌드 도구(Style Dictionary 등)는 도입하지 않고, CSS 변수(`:root`)로 직접 관리한다.
- 토큰 저장 위치: `frontend/src/app/styles/`에 CSS 변수 파일(예: `tokens.css`)로 두고, 상태 색상 매핑 함수는 `frontend/src/shared/lib/todoStatus.ts`(상태 계산 로직)와 같은 슬라이스에서 상태값 → 색상 토큰 매핑 상수로 함께 관리한다(`5-project-principle.md` 6절 `shared/lib` 위치 기준).

## 1. 컬러 팔레트

### 1.1 브랜드/기본 색상

| 토큰명 | 용도 | Hex |
|---|---|---|
| `--color-primary` | 주요 액션(가입하기/로그인/저장/할일 추가 버튼, 활성 탭) | `#0B5CD7` |
| `--color-primary-hover` | Primary 버튼 hover | `#0947AD` |
| `--color-primary-light` | Primary 배경 톤(선택된 필터 칩 배경 등) | `#E8F0FE` |
| `--color-navy` | 헤더/사이드바 배경(포인트로만 사용, 전면 배경 아님) | `#0B1E3F` |
| `--color-sky` | 강조 텍스트/아이콘 포인트(네이비 배경 위 대비용) | `#3FA9F5` |

- `--color-primary`, `--color-sky`는 참고 이미지의 스카이블루 계열에서, `--color-navy`는 이미지의 짙은 네이비 배경에서 추출했다. 다만 본 앱에서 `--color-navy`는 헤더(S3 상단바) 등 국소 영역에만 쓰고 본문 배경에는 쓰지 않는다.

### 1.2 배경/표면/텍스트/보더

| 토큰명 | 용도 | Hex |
|---|---|---|
| `--color-bg` | 페이지 기본 배경 | `#F5F7FA` |
| `--color-surface` | 카드/모달/입력 필드 등 표면 | `#FFFFFF` |
| `--color-text` | 본문 텍스트(기본) | `#1A1F2B` |
| `--color-text-secondary` | 보조 텍스트(날짜, 캡션, placeholder) | `#5B6472` |
| `--color-border` | 입력 필드/카드 테두리, 구분선 | `#DDE2EA` |
| `--color-danger` | 삭제 버튼, 에러 메시지, 지연 상태 | `#D93A3A` |
| `--color-danger-hover` | Danger 버튼 hover | `#B92E2E` |

### 1.3 할일 상태 4종 색상 (도메인 정의서 4장 기준)

와이어프레임 S3의 상태 배지 색상 예시(회색/파랑/초록/빨강)를 참고 이미지 팔레트 톤에 맞춰 확정한다. 색상만으로 구분하지 않고 아이콘(○◐●!)을 항상 함께 표기한다(와이어프레임 S3 규칙 유지).

| 상태 | 배지 배경 | 배지 텍스트 | 좌측 아이콘 |
|---|---|---|---|
| 시작 전 (NOT_STARTED) | `--color-status-notstarted-bg` `#EDEFF3` | `--color-status-notstarted-text` `#5B6472` | ○ |
| 진행중 (IN_PROGRESS) | `--color-status-inprogress-bg` `#E8F0FE` | `--color-status-inprogress-text` `#0B5CD7` | ◐ |
| 지연 (OVERDUE) | `--color-status-overdue-bg` `#FCEAEA` | `--color-status-overdue-text` `#D93A3A` | ! |
| 완료 (COMPLETED) | `--color-status-completed-bg` `#E6F6EC` | `--color-status-completed-text` `#1F9254` | ● (텍스트 취소선) |

- 진행중 배지는 Primary 컬러 계열과 동일 톤(`--color-primary`)을 재사용해 "지금 진행 중인 것 = 브랜드 강조색"이라는 직관을 준다.
- 카테고리 배지는 상태 배지와 구분되도록 outline 스타일만 사용한다: 배경 없음, `border: 1px solid var(--color-border)`, 텍스트 `--color-text-secondary`.

## 2. 타이포그래피

- **폰트 패밀리**: `Pretendard` (한글/영문 모두 지원하는 가변 웹폰트, 굵은 웨이트에서 참고 이미지의 굵은 산세리프 타이틀 느낌 재현 가능). 폴백: `-apple-system, "Malgun Gothic", sans-serif`.
  ```css
  --font-family: "Pretendard Variable", Pretendard, -apple-system, "Malgun Gothic", sans-serif;
  ```
- 신규 의존성 최소화 원칙에 따라 CDN(`@font-face` CSS import) 방식으로 적용하고 별도 폰트 최적화 라이브러리는 추가하지 않는다.

| 스타일 토큰 | 용도 | 크기 | 굵기 | line-height |
|---|---|---|---|---|
| `--text-h1` | 페이지 타이틀(로그인/회원가입 카드 제목 등은 h2 사용, h1은 랜딩성 타이틀용으로 예약) | 28px | 700 (Bold) | 1.3 |
| `--text-h2` | 화면/섹션 제목("회원가입", "할일 수정" 등) | 22px | 700 (Bold) | 1.35 |
| `--text-h3` | 카드/그룹 소제목(카테고리 관리 목록 헤더 등) | 17px | 600 (SemiBold) | 1.4 |
| `--text-body` | 본문/입력값/할일 제목 | 15px | 400 (Regular) | 1.5 |
| `--text-body-strong` | 할일 목록 항목 제목, 버튼 라벨 | 15px | 600 (SemiBold) | 1.5 |
| `--text-caption` | 날짜, 보조 설명, 배지 텍스트 | 13px | 400 (Regular) | 1.4 |

- 모바일에서는 h2를 20px로 1단계만 축소한다(별도 h1/h3 축소는 두지 않는다 — MVP 범위상 과도한 반응형 타이포 스케일 생략).

## 3. 여백/그리드

### 3.1 Spacing scale (4px 기준)

| 토큰명 | 값 | 용도 예시 |
|---|---|---|
| `--space-1` | 4px | 아이콘-텍스트 간격 |
| `--space-2` | 8px | 배지 내부 padding, 폼 라벨-입력 간격 |
| `--space-3` | 12px | 버튼 내부 padding(상하) |
| `--space-4` | 16px | 카드 내부 padding, 입력 필드 간 간격 |
| `--space-5` | 24px | 섹션 간 간격, 카드 사이 gap |
| `--space-6` | 32px | 페이지 상하 여백(데스크톱) |
| `--space-8` | 48px | 카드형 폼(S1/S2/S8) 바깥 여백(데스크톱) |

### 3.2 반응형 브레이크포인트 (`4-wireframe.md` 기준)

| 구분 | 범위 | 비고 |
|---|---|---|
| 모바일 | `< 768px` | 단일 컬럼, 카테고리/상태 필터는 드롭다운, 할일 추가는 FAB |
| 태블릿(중간 구간) | `768px ~ 1023px` | 별도 레이아웃 정의 없음 — 모바일 레이아웃을 그대로 확장 적용(폭만 가변) |
| 데스크톱 | `>= 1024px` | 좌측 카테고리 사이드바 + 우측 목록, 상단 헤더 액션 버튼 |

- 미디어쿼리 기준값은 `768px`, `1024px` 두 개만 사용한다(PRD 5.3절 "반응형 웹" 요구사항 범위 내 최소 구성).

### 3.3 그리드/카드 폭

- 단일 컬럼 폼 카드(S1/S2/S8): 데스크톱 최대 너비 `480px`(회원가입/로그인), `560px`(할일 등록/수정), 모바일은 `100% - 32px(좌우 여백 16px씩)`.
- 할일 목록(S3): 데스크톱 좌측 사이드바 고정 폭 `240px` + 우측 본문 `flex: 1`, 사이드바-본문 간격 `--space-5`.

## 4. 컴포넌트 스타일

### 4.1 공통 라운딩/그림자

| 토큰명 | 값 | 용도 |
|---|---|---|
| `--radius-sm` | 6px | 배지/태그, 인풋 |
| `--radius-md` | 10px | 버튼, 카드(할일 항목) |
| `--radius-lg` | 16px | 모달, 폼 카드(S1/S2/S8 전체 카드) |
| `--shadow-card` | `0 1px 3px rgba(15, 23, 42, 0.08)` | 할일 항목 카드, 폼 카드 |
| `--shadow-modal` | `0 8px 24px rgba(15, 23, 42, 0.16)` | 삭제 확인 모달(S6) |

### 4.2 버튼

| 종류 | 배경 | 텍스트 | 테두리 | Hover | Disabled |
|---|---|---|---|---|---|
| Primary (가입하기/로그인/저장/할일추가) | `--color-primary` | `#FFFFFF` | 없음 | `--color-primary-hover` | 배경 `#B9CCF0`, 텍스트 `#FFFFFF`, cursor: not-allowed |
| Secondary (취소) | `--color-surface` | `--color-text` | `1px solid var(--color-border)` | 배경 `#F5F7FA` | 텍스트 `--color-text-secondary`, 테두리 유지 |
| Danger (삭제) | `--color-danger` | `#FFFFFF` | 없음 | `--color-danger-hover` | 배경 `#F3B9B9` |

- 공통 규격: `padding: var(--space-3) var(--space-5)`, `border-radius: var(--radius-md)`, `font: var(--text-body-strong)`.
- Focus 상태(키보드 접근): `outline: 2px solid var(--color-sky); outline-offset: 2px`(a11y는 PRD상 MVP 범위 밖이지만, 최소한의 포커스 링은 기본 브라우저 동작을 막지 않는 선에서 유지).
- 모바일 FAB(S3 "+"): 원형, 지름 `56px`, 배경 `--color-primary`, `box-shadow: var(--shadow-card)`.

### 4.3 입력 필드 (텍스트/이메일/비밀번호/textarea/select)

- 기본: `padding: var(--space-2) var(--space-3)`, `border: 1px solid var(--color-border)`, `border-radius: var(--radius-sm)`, 배경 `--color-surface`, `font: var(--text-body)`.
- Focus: `border-color: var(--color-primary)`, `box-shadow: 0 0 0 3px var(--color-primary-light)`.
- Error(유효성 오류, 예: BR-04 위반): `border-color: var(--color-danger)`, 하단에 `--text-caption` 크기의 `--color-danger` 텍스트로 오류 메시지 표시(와이어프레임 `[!]` 영역).
- placeholder 텍스트: `--color-text-secondary`.

### 4.4 카드 (할일 목록 항목, S3)

- 표면: `background: var(--color-surface)`, `border: 1px solid var(--color-border)`, `border-radius: var(--radius-md)`, `box-shadow: var(--shadow-card)`, `padding: var(--space-4)`.
- 항목 간 간격: `--space-3`(리스트 내부), 카드 자체는 구분선 대신 카드 단위 분리를 사용한다(와이어프레임 ASCII의 표 구분선은 실제 구현 시 카드+gap으로 대체).
- 완료(COMPLETED) 상태 카드는 제목 텍스트에 `text-decoration: line-through`, `color: var(--color-text-secondary)`를 적용해 흐리게 표시한다(도메인 정의서 4장, 완료 최우선 판정 규칙 반영).

### 4.5 모달 (삭제 확인, S6)

- 배경 딤: `rgba(15, 23, 42, 0.4)`.
- 모달 박스: `background: var(--color-surface)`, `border-radius: var(--radius-lg)`, `box-shadow: var(--shadow-modal)`, 데스크톱 폭 `400px` 고정, 모바일 폭 `90%`.
- 버튼 배치: 취소(Secondary) + 삭제(Danger) 순서, 우측 정렬(데스크톱) / 전체 폭 2등분(모바일).

### 4.6 배지/태그

- 상태 배지: `padding: var(--space-1) var(--space-2)`, `border-radius: var(--radius-sm)`, `font: var(--text-caption)`, `font-weight: 600`, 1.3절 색상 조합 사용, 아이콘+텍스트 함께 표기.
- 카테고리 배지(outline): `padding: var(--space-1) var(--space-2)`, `border-radius: var(--radius-sm)`, `border: 1px solid var(--color-border)`, `color: var(--color-text-secondary)`, 배경 없음.

## 5. 기타 톤앤매너

- **아이콘**: 별도 아이콘 폰트/라이브러리를 신규로 추가하지 않고, 상태 표시는 유니코드/텍스트 기호(○◐●!)와 이모지(📅, ≡)를 와이어프레임 표기 그대로 사용한다(2일 MVP 기준 아이콘 SVG 세트 구축은 과설계로 판단).
- **그림자**: 4.1절 두 종(`--shadow-card`, `--shadow-modal`) 외 추가 단계(예: xl, 2xl)를 만들지 않는다.
- **모션**: 버튼/입력 필드 hover·focus 전환만 `transition: all 0.15s ease` 한 줄로 적용한다. 모달 등장은 opacity 페이드(`0.15s`)만 사용하고 별도 애니메이션 라이브러리는 도입하지 않는다.
- **아이콘/색상 외 상태 구분**: 1.3절 상태 배지는 색상 대비뿐 아니라 텍스트 라벨("시작전/진행중/지연/완료")과 아이콘을 항상 함께 노출해 색맹 사용자도 구분 가능하게 한다(와이어프레임 S3 원칙 유지, 별도 a11y 작업 확대는 하지 않음).

## 6. 다크 테마 토큰 (MVP 이후)

- `[data-theme='dark']`가 `<html>`에 설정되면 아래 토큰이 1~4절의 라이트 값을 덮어쓴다. 새 토큰명은 만들지 않고 기존 토큰의 값만 교체한다.
- 적용 방식: `shared/lib/theme.ts`가 `localStorage`(`mtl_theme`) 또는 OS `prefers-color-scheme`으로 초기값을 정하고, 헤더의 `ThemeToggle` 버튼으로 전환한다.

| 토큰명 | 라이트 | 다크 |
|---|---|---|
| `--color-primary` | `#0B5CD7` | `#4C9CF0` |
| `--color-primary-hover` | `#0947AD` | `#6FB1F5` |
| `--color-primary-light` | `#E8F0FE` | `rgba(76, 156, 240, 0.16)` |
| `--color-danger` | `#D93A3A` | `#F0665F` |
| `--color-border` | `#DDE2EA` | `#2B3242` |
| `--color-surface` | `#FFFFFF` | `#171B27` |
| `--color-bg` | `#F5F7FA` | `#0E1219` |
| `--color-text` | `#1A1F2B` | `#E7EAF0` |
| `--color-text-secondary` | `#5B6472` | `#9AA3B5` |
| `--shadow-card` | `0 1px 3px rgba(15, 23, 42, 0.08)` | `0 1px 3px rgba(0, 0, 0, 0.4)` |
| `--shadow-modal` | `0 8px 24px rgba(15, 23, 42, 0.16)` | `0 8px 24px rgba(0, 0, 0, 0.55)` |
| `--status-notstarted-bg` / `-text` | `#EDEFF3` / `#5B6472` | `#232838` / `#9AA3B5` |
| `--status-inprogress-bg` / `-text` | `#E8F0FE` / `#0B5CD7` | `rgba(76,156,240,0.18)` / `#6FB1F5` |
| `--status-overdue-bg` / `-text` | `#FCEAEA` / `#D93A3A` | `rgba(240,102,95,0.18)` / `#F0918C` |
| `--status-completed-bg` / `-text` | `#E6F6EC` / `#1F9254` | `rgba(46,176,106,0.18)` / `#5FD08C` |

- `--color-navy`, `--color-sky`(헤더 포인트 색)는 다크 모드에서도 동일 값 유지(변경 없음).
