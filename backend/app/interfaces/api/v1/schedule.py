from datetime import date
from fastapi import APIRouter, Depends, Query
from sqlalchemy.orm import Session
from app.infrastructure.database.session import get_db
from app.infrastructure.database.models import User
from app.core.deps import get_current_user
from app.infrastructure.repositories import schedule_repo
from app.interfaces.schemas.schedule import ScheduleEventOut, ScheduleEventCreate

router = APIRouter(prefix="/schedule", tags=["schedule"])


@router.get("", response_model=list[ScheduleEventOut])
def list_events(
    week: date = Query(default=None, description="Week start date (YYYY-MM-DD)"),
    db: Session = Depends(get_db),
    _: User = Depends(get_current_user),
):
    if week is None:
        today = date.today()
        week = today - __import__("datetime").timedelta(days=today.weekday())
    return schedule_repo.get_week(db, week)


@router.post("", response_model=ScheduleEventOut, status_code=201)
def create_event(body: ScheduleEventCreate, db: Session = Depends(get_db), _: User = Depends(get_current_user)):
    return schedule_repo.create(db, body)
