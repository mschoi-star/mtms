from uuid import UUID
from pydantic import BaseModel


class TeamMemberOut(BaseModel):
    id: UUID
    name: str
    role: str
    department: str
    status: str
    email: str

    model_config = {"from_attributes": True}
