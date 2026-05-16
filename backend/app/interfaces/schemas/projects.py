from uuid import UUID
from datetime import datetime
from typing import Literal, Optional
from pydantic import BaseModel, ConfigDict, Field, field_validator

ProjectStatus = Literal["active", "in review", "on hold", "complete"]
PROJECT_CODE_MAX_LENGTH = 20
PROJECT_NAME_MAX_LENGTH = 200
PROJECT_TEAM_MAX_LENGTH = 50


class ProjectOut(BaseModel):
    id: UUID
    code: str
    name: str
    team: str
    description: Optional[str] = None
    progress: int
    status: ProjectStatus
    created_at: datetime
    updated_at: datetime

    model_config = {"from_attributes": True}


class ProjectCreate(BaseModel):
    code: Optional[str] = Field(default=None, max_length=PROJECT_CODE_MAX_LENGTH)
    name: str = Field(min_length=1, max_length=PROJECT_NAME_MAX_LENGTH)
    team: str = Field(default="", max_length=PROJECT_TEAM_MAX_LENGTH)
    description: Optional[str] = None
    progress: int = Field(default=0, ge=0, le=100)
    status: ProjectStatus = "active"

    model_config = ConfigDict(extra="forbid")

    @field_validator("code", mode="before")
    @classmethod
    def normalize_code(cls, value: Optional[str]) -> Optional[str]:
        if isinstance(value, str):
            normalized = value.strip().upper()
            return normalized or None
        return value

    @field_validator("name", mode="before")
    @classmethod
    def strip_name(cls, value: str) -> str:
        if isinstance(value, str):
            return value.strip()
        return value


class ProjectUpdate(BaseModel):
    name: Optional[str] = Field(default=None, min_length=1, max_length=PROJECT_NAME_MAX_LENGTH)
    team: Optional[str] = Field(default=None, max_length=PROJECT_TEAM_MAX_LENGTH)
    description: Optional[str] = None
    progress: Optional[int] = Field(default=None, ge=0, le=100)
    status: Optional[ProjectStatus] = None

    model_config = ConfigDict(extra="forbid")

    @field_validator("name", mode="before")
    @classmethod
    def strip_name(cls, value: Optional[str]) -> Optional[str]:
        if isinstance(value, str):
            return value.strip()
        return value
