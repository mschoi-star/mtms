from uuid import UUID
from datetime import date, datetime
from pydantic import BaseModel, ConfigDict, Field, field_validator


class ScheduleEventOut(BaseModel):
    id: UUID
    title: str
    event_date: date
    hour: str
    created_at: datetime

    model_config = {"from_attributes": True}


class ScheduleEventCreate(BaseModel):
    title: str = Field(min_length=1, max_length=200)
    event_date: date
    hour: str = "09"

    model_config = ConfigDict(extra="forbid")

    @field_validator("title", mode="before")
    @classmethod
    def strip_title(cls, value: str) -> str:
        if isinstance(value, str):
            return value.strip()
        return value

    @field_validator("hour", mode="before")
    @classmethod
    def normalize_hour(cls, value: str) -> str:
        if isinstance(value, int):
            value = str(value)
        if not isinstance(value, str) or not value.isdigit():
            raise ValueError("hour must be an integer string between 00 and 23")
        hour = int(value)
        if hour < 0 or hour > 23:
            raise ValueError("hour must be between 00 and 23")
        return f"{hour:02d}"
