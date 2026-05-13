from uuid import UUID
from datetime import datetime
from pydantic import BaseModel


class MessageOut(BaseModel):
    id: UUID
    sender_name: str
    sender_email: str
    subject: str
    body: str
    is_unread: bool
    sent_at: datetime

    model_config = {"from_attributes": True}
