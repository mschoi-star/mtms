from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from app.infrastructure.database.session import get_db
from app.infrastructure.database.models import User
from app.core.deps import get_current_user
from app.infrastructure.repositories import team_repo
from app.interfaces.schemas.team import TeamMemberOut

router = APIRouter(prefix="/team", tags=["team"])


@router.get("", response_model=list[TeamMemberOut])
def list_team(db: Session = Depends(get_db), _: User = Depends(get_current_user)):
    return team_repo.get_all(db)
