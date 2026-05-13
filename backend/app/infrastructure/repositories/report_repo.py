from uuid import UUID
from typing import Optional
from sqlalchemy.orm import Session
from app.infrastructure.database.models import Report


def get_all(db: Session) -> list[Report]:
    return db.query(Report).order_by(Report.code.desc()).all()


def get_by_id(db: Session, report_id: UUID) -> Optional[Report]:
    return db.query(Report).filter(Report.id == report_id).first()
