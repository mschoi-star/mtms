# MTMS 구축 작업 순서

디자인 기준: `design/mtms-desktop.html` (5개 JSX 컴포넌트 기반)  
스택: React 18 + TypeScript · Vite 5 · FastAPI · PostgreSQL 16

---

## Phase 1 — 디자인 기반 (Frontend)

### 1-1. 글로벌 스타일 & 폰트 설정
- `frontend/index.html`: Google Fonts 링크 추가 (Inter, JetBrains Mono, Noto Sans KR)
- `frontend/src/styles/globals.css`: CSS 변수 선언
  ```
  --bg: #ffffff       --ink: #1f2430       --ink-soft: #4a5160
  --line: #e6e3dd     --line-strong: #d6d1c5
  --warm: #c8a57a     --warm-soft: #ecdfca  --warm-deep: #8a6a44
  ```
- `frontend/src/main.tsx`: globals.css import

### 1-2. 공통 UI 컴포넌트
- `src/components/ui/Tag.tsx` — 인라인 태그 (tone: 'ink' | 'warm')
- `src/components/ui/Bar.tsx` — 진행률 바 (value, label)
- `src/components/ui/Section.tsx` — 섹션 래퍼 (title, right?)
- `src/components/ui/Toggle.tsx` — 커스텀 토글 스위치

---

## Phase 2 — 마스코트 & 레이아웃 컴포넌트

### 2-1. Hamster 컴포넌트
- `src/components/Hamster.tsx`
  - SVG 전신 (원/타원만 사용), props: `size`, `flip`, `stride`
  - 보디/머리/귀/눈/코/꼬리/발 구현

### 2-2. HamsterRun 컴포넌트
- `src/components/HamsterRun.tsx`
  - `requestAnimationFrame` 루프로 5마리 횡단
  - 각자 다른 속도·크기·y오프셋·딜레이
  - 하단 점선 지면 라인

### 2-3. MenuBar
- `src/components/layout/MenuBar.tsx`
  - 높이 28px, dark (#1f2430) 배경
  - 좌: ▚ MTMS · 앱명 · File · View · Window
  - 우: 탭 수 · 유저 sign-out 버튼 · 시계 (30초 갱신)

### 2-4. Sidebar
- `src/components/layout/Sidebar.tsx`
  - 폭 116px, 상단 헤더 (▚ MTMS), 하단 버전 표시
  - `ProgramIcon` 서브컴포넌트: 60×60 아이콘 타일 + 라벨
  - 8개 앱 아이콘 (SVG 글리프 인라인): Dashboard · Projects · Reports · Schedule · Inbox · Team · Files · Settings
  - active 상태: dashed outline + shadow offset 효과

### 2-5. BrowserWindow
- `src/components/layout/BrowserWindow.tsx`
  - position: absolute, left/top/right 20px, bottom 200px
  - 타이틀바: traffic light 버튼 3개 + 타이틀 텍스트 (횡줄 배경)
  - 탭 스트립: 탭 추가/활성/닫기, 빈 상태 안내
  - URL 바: ‹ › ↻ 버튼 + `mtms://...` 주소창 + ☆
  - 바디: 활성 탭 컨텐츠 렌더링

---

## Phase 3 — 앱 모듈 컨텐츠

### 3-1. Dashboard
- `src/apps/DashboardApp.tsx`
  - 4열 통계 카드 (Active·Pending·Team·Uptime)
  - 팀별 Capacity Bar 차트
  - 최근 활동 목록 (그리드 레이아웃)

### 3-2. Projects
- `src/apps/ProjectsApp.tsx`
  - 테이블 헤더 (dark bg), 행 줄무늬 배경
  - 진행률 미니바 + 상태 Tag

### 3-3. Reports
- `src/apps/ReportsApp.tsx`
  - 12개월 Bar 차트 (최신 달 ink 색, 나머지 warm)
  - 보고서 목록 (상태 Tag)

### 3-4. Schedule
- `src/apps/ScheduleApp.tsx`
  - 7열 주간 캘린더 그리드
  - 오늘 날짜 하이라이트 (#fbf3e2), TODAY 배지
  - 이벤트 블록 (warm 배경)

### 3-5. Inbox
- `src/apps/InboxApp.tsx`
  - 2열 레이아웃 (280px 목록 | 본문)
  - 읽음/안읽음 구분, 선택된 메일 상세
  - Approve / Request changes 버튼

### 3-6. Team
- `src/apps/TeamApp.tsx`
  - 2열 카드 그리드
  - 이니셜 아바타 (warm 배경), 이름·직책·부서
  - 온라인 상태 Tag

### 3-7. Files
- `src/apps/FilesApp.tsx`
  - 파일 트리 테이블 (type·name·size·modified)
  - 디렉토리 ▸ 아이콘 (warm), 파일 · (soft)

### 3-8. Settings
- `src/apps/SettingsApp.tsx`
  - 토글 스위치 3개 (알림·다크·베타)
  - 상태 로컬 관리

---

## Phase 4 — 로그인 & 데스크탑 셸

### 4-1. LoginPage
- `src/pages/LoginPage.tsx`
  - 전체화면, 배경 그리드, 상단 OS 바
  - 중앙 로그인 폼 윈도우 (4px shadow offset)
  - Hamster 마스코트, HamsterRun 하단
  - ID/PW 입력, Remember me 체크박스, Forgot password 링크
  - 700ms 인증 딜레이 후 `onLogin` 콜백

### 4-2. DesktopShell
- `src/pages/DesktopShell.tsx`
  - Sidebar + 메인영역 (MenuBar + 데스크탑 영역)
  - 데스크탑: 그리드 배경 + 워터마크 + HamsterRun + BrowserWindow
  - 탭 상태 관리: `openApp` / `closeTab` / `activate`
  - 마운트 시 Dashboard 자동 오픈

### 4-3. App 진입점 (Auth Gate)
- `src/App.tsx`: `authed` 상태에 따라 LoginPage ↔ DesktopShell 전환
- 라우터 불필요 (SPA 내부 상태로 처리)

---

## Phase 5 — 백엔드 API

### 5-1. 인증
- `backend/app/domain/entities/user.py` — User 엔티티
- `backend/app/interfaces/api/v1/auth.py` — POST `/api/v1/auth/login`
- JWT 또는 세션 기반 (Pydantic 스키마 포함)

### 5-2. 프로젝트 API
- `backend/app/domain/entities/project.py`
- `backend/app/interfaces/api/v1/projects.py`
- CRUD: GET `/projects`, GET `/projects/{id}`, POST, PATCH, DELETE

### 5-3. 보고서 API
- `backend/app/interfaces/api/v1/reports.py`
- GET `/reports`, GET `/reports/{id}`

### 5-4. 일정 API
- `backend/app/interfaces/api/v1/schedule.py`
- GET `/schedule?week=`, POST `/schedule`

### 5-5. 인박스 API
- `backend/app/interfaces/api/v1/inbox.py`
- GET `/inbox`, PATCH `/inbox/{id}/read`

### 5-6. 팀 API
- `backend/app/interfaces/api/v1/team.py`
- GET `/team`

### 5-7. 파일 API
- `backend/app/interfaces/api/v1/files.py`
- GET `/files?path=`

---

## Phase 6 — DB 마이그레이션

### 6-1. 테이블 스키마 정의
- `db/init/01_init.sql` 업데이트
  - users, projects, reports, schedule_events, messages, team_members, files

### 6-2. Alembic 마이그레이션
- 초기 마이그레이션 생성 및 실행

---

## Phase 7 — 프론트↔백엔드 연결

### 7-1. API 클라이언트 설정
- `src/services/api.ts`: axios baseURL, 인터셉터 (토큰 주입)

### 7-2. 앱별 API 훅 연결
- 각 App 모듈의 mock 데이터를 실제 API 호출로 교체
- 로딩 상태, 에러 처리

---

## Phase 8 — 인프라

### 8-1. Docker 구성 검토
- `docker/docker-compose.yml` 포트·볼륨·환경변수 확인
- frontend Dockerfile: `npm run build` → nginx 서빙
- backend Dockerfile: uvicorn 기동

### 8-2. 환경변수
- `backend/.env`: DB_URL, SECRET_KEY, CORS_ORIGINS
- `frontend/.env`: VITE_API_BASE_URL

---

## 작업 우선순위 요약

| 순서 | 내용 | 결과물 |
|------|------|--------|
| 1 | Phase 1–2 | 스타일 + 레이아웃 골격 |
| 2 | Phase 3–4 | 완전한 프론트엔드 UI |
| 3 | Phase 5–6 | 백엔드 API + DB |
| 4 | Phase 7 | 실데이터 연결 |
| 5 | Phase 8 | 컨테이너 배포 |

**현재 시작점:** Phase 1-1 (글로벌 스타일) → Phase 2-1 (Hamster) → Phase 4 (셸) 순서로 진행하면 가장 빠르게 동작하는 UI를 확인할 수 있습니다.
