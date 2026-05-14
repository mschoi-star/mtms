from uuid import UUID
from datetime import datetime
from typing import Optional
from pydantic import BaseModel


class ProjectOut(BaseModel):
    id: UUID
    code: str
    name: str
    team: str
    description: Optional[str] = None
    progress: int
    status: str
    created_at: datetime
    updated_at: datetime

    model_config = {"from_attributes": True}


class ProjectCreate(BaseModel):
    code: str
    name: str
    team: str = ""
    description: Optional[str] = None
    progress: int = 0
    status: str = "active"


class ProjectUpdate(BaseModel):
    name: Optional[str] = None
    team: Optional[str] = None
    description: Optional[str] = None
    progress: Optional[int] = None
    status: Optional[str] = None
