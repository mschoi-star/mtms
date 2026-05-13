from uuid import UUID
from datetime import date, datetime
from typing import Optional
from pydantic import BaseModel


class ScheduleEventOut(BaseModel):
    id: UUID
    title: str
    event_date: date
    hour: str
    created_at: datetime

    model_config = {"from_attributes": True}


class ScheduleEventCreate(BaseModel):
    title: str
    event_date: date
    hour: str = "09"
