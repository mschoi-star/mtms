import uuid
from datetime import date, datetime, timezone
from sqlalchemy import Boolean, Column, Date, DateTime, Integer, String, Text
from sqlalchemy.dialects.postgresql import UUID
from app.infrastructure.database.session import Base


def _now():
    return datetime.now(timezone.utc)


class User(Base):
    __tablename__ = "users"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    email = Column(String(255), unique=True, nullable=False, index=True)
    display_name = Column(String(100), nullable=False)
    hashed_password = Column(String(255), nullable=False)
    department = Column(String(100), default="")
    role = Column(String(100), default="")
    status = Column(String(20), default="offline")
    created_at = Column(DateTime(timezone=True), default=_now)


class Project(Base):
    __tablename__ = "projects"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    code = Column(String(20), unique=True, nullable=False)
    name = Column(String(200), nullable=False)
    team = Column(String(50), default="")
    progress = Column(Integer, default=0)
    status = Column(String(30), default="active")
    created_at = Column(DateTime(timezone=True), default=_now)
    updated_at = Column(DateTime(timezone=True), default=_now, onupdate=_now)


class Report(Base):
    __tablename__ = "reports"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    code = Column(String(20), unique=True, nullable=False)
    title = Column(String(200), nullable=False)
    status = Column(String(20), default="draft")
    created_at = Column(DateTime(timezone=True), default=_now)


class ScheduleEvent(Base):
    __tablename__ = "schedule_events"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    title = Column(String(200), nullable=False)
    event_date = Column(Date, nullable=False)
    hour = Column(String(5), default="09")
    created_at = Column(DateTime(timezone=True), default=_now)


class Message(Base):
    __tablename__ = "messages"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    sender_name = Column(String(100), nullable=False)
    sender_email = Column(String(255), nullable=False)
    subject = Column(String(300), nullable=False)
    body = Column(Text, default="")
    is_unread = Column(Boolean, default=True)
    sent_at = Column(DateTime(timezone=True), default=_now)


class TeamMember(Base):
    __tablename__ = "team_members"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    name = Column(String(100), nullable=False)
    role = Column(String(100), default="")
    department = Column(String(100), default="")
    status = Column(String(20), default="offline")
    email = Column(String(255), default="")


class FileEntry(Base):
    __tablename__ = "file_entries"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    entry_type = Column(String(10), default="file")  # 'dir' or 'file'
    name = Column(String(255), nullable=False)
    path = Column(String(500), nullable=False)
    size_label = Column(String(20), default="—")
    modified_at = Column(Date, default=date.today)
