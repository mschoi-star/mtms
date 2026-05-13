from uuid import UUID
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from app.infrastructure.database.session import get_db
from app.infrastructure.database.models import User
from app.core.deps import get_current_user
from app.infrastructure.repositories import inbox_repo
from app.interfaces.schemas.inbox import MessageOut

router = APIRouter(prefix="/inbox", tags=["inbox"])


@router.get("", response_model=list[MessageOut])
def list_messages(db: Session = Depends(get_db), _: User = Depends(get_current_user)):
    return inbox_repo.get_all(db)


@router.patch("/{message_id}/read", response_model=MessageOut)
def mark_read(message_id: UUID, db: Session = Depends(get_db), _: User = Depends(get_current_user)):
    message = inbox_repo.get_by_id(db, message_id)
    if not message:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Message not found")
    return inbox_repo.mark_read(db, message)
