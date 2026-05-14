from uuid import UUID
from typing import Optional
from sqlalchemy.orm import Session
from app.infrastructure.database.models import Report


def get_all(db: Session, project_id: Optional[UUID] = None) -> list[Report]:
    q = db.query(Report)
    if project_id:
        q = q.filter(Report.project_id == project_id)
    return q.order_by(Report.code.desc()).all()


def get_by_id(db: Session, report_id: UUID) -> Optional[Report]:
    return db.query(Report).filter(Report.id == report_id).first()


def create(db: Session, title: str, content: Optional[str], project_id: Optional[UUID] = None) -> Report:
    count = db.query(Report).count()
    code = f"RPT-{count + 1:03d}"
    report = Report(code=code, title=title, content=content, status="draft", project_id=project_id)
    db.add(report)
    db.commit()
    db.refresh(report)
    return report
