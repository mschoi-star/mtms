from datetime import date, timedelta
from sqlalchemy.orm import Session
from app.infrastructure.database.models import ScheduleEvent
from app.interfaces.schemas.schedule import ScheduleEventCreate


def get_week(db: Session, week_start: date) -> list[ScheduleEvent]:
    week_end = week_start + timedelta(days=6)
    return (
        db.query(ScheduleEvent)
        .filter(ScheduleEvent.event_date >= week_start, ScheduleEvent.event_date <= week_end)
        .order_by(ScheduleEvent.event_date, ScheduleEvent.hour)
        .all()
    )


def create(db: Session, data: ScheduleEventCreate) -> ScheduleEvent:
    event = ScheduleEvent(**data.model_dump())
    db.add(event)
    db.commit()
    db.refresh(event)
    return event
