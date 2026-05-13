from fastapi import APIRouter, Depends, Query
from sqlalchemy.orm import Session
from app.infrastructure.database.session import get_db
from app.infrastructure.database.models import User
from app.core.deps import get_current_user
from app.infrastructure.repositories import files_repo
from app.interfaces.schemas.files import FileEntryOut

router = APIRouter(prefix="/files", tags=["files"])


@router.get("", response_model=list[FileEntryOut])
def list_files(
    path: str = Query(default="/", description="Directory path"),
    db: Session = Depends(get_db),
    _: User = Depends(get_current_user),
):
    return files_repo.get_entries(db, path)
