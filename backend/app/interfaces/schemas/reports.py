from uuid import UUID
from datetime import datetime
from typing import Optional
from pydantic import BaseModel


class ReportCreate(BaseModel):
    title: str
    content: Optional[str] = None
    project_id: Optional[UUID] = None


class ReportOut(BaseModel):
    id: UUID
    code: str
    title: str
    content: Optional[str] = None
    status: str
    project_id: Optional[UUID] = None
    created_at: datetime

    model_config = {"from_attributes": True}
