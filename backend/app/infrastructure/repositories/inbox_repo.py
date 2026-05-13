from uuid import UUID
from typing import Optional
from sqlalchemy.orm import Session
from app.infrastructure.database.models import Message


def get_all(db: Session) -> list[Message]:
    return db.query(Message).order_by(Message.sent_at.desc()).all()


def get_by_id(db: Session, message_id: UUID) -> Optional[Message]:
    return db.query(Message).filter(Message.id == message_id).first()


def mark_read(db: Session, message: Message) -> Message:
    message.is_unread = False
    db.commit()
    db.refresh(message)
    return message
