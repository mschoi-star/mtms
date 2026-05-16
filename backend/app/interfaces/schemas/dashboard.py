from typing import List, Union
from pydantic import BaseModel


class DashboardStat(BaseModel):
    key: str
    value: Union[int, float, str]
    suffix: str


class DashboardActivity(BaseModel):
    time: str
    actor: str
    action: str
    target: str


class TeamCapacity(BaseModel):
    label: str
    value: int


class DashboardSummary(BaseModel):
    stats: List[DashboardStat]
    capacity: List[TeamCapacity]
    activities: List[DashboardActivity]
