# MTMS — Mission Task Management System

CAE 팀을 위한 프로젝트 및 일일업무 보고 관리 웹 애플리케이션입니다.

## 기술 스택

| 구분 | 기술 |
|------|------|
| Frontend | React 18 + TypeScript, Vite 5, react-router-dom 6, axios |
| Backend | FastAPI 0.115, Uvicorn, SQLAlchemy 2, Pydantic 2 |
| Auth | python-jose JWT (8h) + passlib[bcrypt] |
| Database | PostgreSQL 16 |
| Infra | Docker Compose, nginx 1.27 (reverse proxy) |

## 아키텍처

Clean Architecture 기반 4-레이어 구조

```
backend/app/
├── domain/          # 엔티티, 리포지토리 인터페이스
├── application/     # 유스케이스
├── infrastructure/  # DB 모델, 리포지토리 구현, seed
└── interfaces/      # FastAPI 라우터, Pydantic 스키마
```

## 실행 방법

### 사전 요구사항

- Docker Desktop

### 시작

```bash
cd docker
docker compose up -d
```

접속: **http://localhost:3000**

### 종료

```bash
cd docker
docker compose down
```

> 데이터는 `pg_data` named volume에 유지됩니다. 완전 초기화 시 `docker compose down -v`

## 포트

| 서비스 | 포트 |
|--------|------|
| Frontend (nginx) | 3000 |
| Backend (FastAPI) | 8000 |
| Database (PostgreSQL) | 5432 |

## 시드 계정

| 이메일 | 비밀번호 |
|--------|----------|
| choi.m@mpse-cae.com | password |
| kim.s@mpse-cae.com | password |
| lee.j@mpse-cae.com | password |
| park.h@mpse-cae.com | password |
| jung.y@mpse-cae.com | password |
| ahn.g@mpse-cae.com | password |

## 주요 기능

### Projects
- 프로젝트 생성 / 삭제
- 상세 정보 편집 (description, 진행률, 상태)
- 프로젝트별 일일업무 보고 목록 조회

### Reports (일일업무 보고)
- 보고 작성 시 프로젝트 연결
- 전체 보고 목록 조회

### 그 외
- Dashboard, Schedule, Inbox, Team, Files, Settings

## API

Base URL: `/api/v1`

| 엔드포인트 | 설명 |
|------------|------|
| `POST /auth/login/json` | 로그인 (JWT 발급) |
| `GET/POST /projects` | 프로젝트 목록 / 생성 |
| `PATCH/DELETE /projects/{id}` | 프로젝트 수정 / 삭제 |
| `GET /reports?project_id=` | 보고 목록 (프로젝트 필터 가능) |
| `POST /reports` | 보고 작성 |
| `GET /schedule` | 일정 조회 |
| `GET /inbox` | 메시지 목록 |
| `GET /team` | 팀원 목록 |
| `GET /files` | 파일 목록 |

## DB 마이그레이션

```bash
# 컨테이너 내부에서 실행
docker exec docker-backend-1 alembic upgrade head
```

마이그레이션 파일은 `backend/migrations/versions/`에 위치합니다.

## 개발 환경 (로컬)

```bash
# 백엔드
cd backend
pip install -r requirements.txt
uvicorn app.main:app --reload --port 8000

# 프론트엔드
cd frontend
npm install
npm run dev   # http://localhost:5173
```

> 로컬 개발 시 포트 3000이 Docker에서 사용 중이면 충돌합니다. (`lsof -i :3000`)
