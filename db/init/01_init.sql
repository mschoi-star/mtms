-- 초기 DB 설정
-- 테이블 생성은 Alembic 마이그레이션으로 관리합니다.
-- 이 파일은 PostgreSQL 컨테이너 최초 실행 시 자동으로 실행됩니다.

CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
