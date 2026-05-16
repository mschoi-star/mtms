from uuid import UUID
from datetime import date, datetime
from typing import Literal, Optional
from pydantic import BaseModel, ConfigDict, Field

ReportStatus = Literal["draft", "submitted", "approved", "rejected"]


class ReportCreate(BaseModel):
    title: str = Field(min_length=1, max_length=200)
    content: Optional[str] = None
    project_id: Optional[UUID] = None
    work_date: Optional[date] = None
    summary: Optional[str] = None
    done: Optional[str] = None
    issue: Optional[str] = None
    next_plan: Optional[str] = None

    model_config = ConfigDict(extra="forbid")


class ReportUpdate(BaseModel):
    title: Optional[str] = Field(default=None, min_length=1, max_length=200)
    content: Optional[str] = None
    project_id: Optional[UUID] = None
    work_date: Optional[date] = None
    summary: Optional[str] = None
    done: Optional[str] = None
    issue: Optional[str] = None
    next_plan: Optional[str] = None

    model_config = ConfigDict(extra="forbid")


class ReportReview(BaseModel):
    comment: Optional[str] = None

    model_config = ConfigDict(extra="forbid")


class ReportOut(BaseModel):
    id: UUID
    code: str
    title: str
    content: Optional[str] = None
    summary: Optional[str] = None
    done: Optional[str] = None
    issue: Optional[str] = None
    next_plan: Optional[str] = None
    status: str
    project_id: Optional[UUID] = None
    author_email: Optional[str] = None
    author_name: Optional[str] = None
    work_date: Optional[date] = None
    review_comment: Optional[str] = None
    submitted_at: Optional[datetime] = None
    reviewed_at: Optional[datetime] = None
    created_at: datetime

    model_config = {"from_attributes": True}
