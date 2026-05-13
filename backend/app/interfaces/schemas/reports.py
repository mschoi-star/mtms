from uuid import UUID
from datetime import datetime
from pydantic import BaseModel


class ReportOut(BaseModel):
    id: UUID
    code: str
    title: str
    status: str
    created_at: datetime

    model_config = {"from_attributes": True}
