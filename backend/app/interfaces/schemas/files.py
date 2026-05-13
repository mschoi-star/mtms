from uuid import UUID
from datetime import date
from pydantic import BaseModel


class FileEntryOut(BaseModel):
    id: UUID
    entry_type: str
    name: str
    path: str
    size_label: str
    modified_at: date

    model_config = {"from_attributes": True}
