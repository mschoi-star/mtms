from uuid import UUID
from datetime import datetime, timezone
from typing import Optional
from sqlalchemy.exc import IntegrityError
from sqlalchemy.orm import Session
from app.infrastructure.database.models import Report, User
from app.interfaces.schemas.reports import ReportCreate, ReportUpdate


def _now():
    return datetime.now(timezone.utc)


def _today():
    return datetime.now().astimezone().date()


def get_all(db: Session, project_id: Optional[UUID] = None) -> list[Report]:
    q = db.query(Report)
    if project_id:
        q = q.filter(Report.project_id == project_id)
    return q.order_by(Report.created_at.desc(), Report.code.desc()).all()


def get_by_id(db: Session, report_id: UUID) -> Optional[Report]:
    return db.query(Report).filter(Report.id == report_id).first()


def _next_code(db: Session) -> str:
    count = db.query(Report).count()
    return f"RPT-{count + 1:03d}"


def _next_code_after_conflict(code: str) -> str:
    try:
        number = int(code.split("-", 1)[1]) + 1
    except (IndexError, ValueError):
        number = 1
    return f"RPT-{number:03d}"


def create(db: Session, body: ReportCreate, author: User) -> Report:
    code = _next_code(db)
    for _ in range(5):
        report = Report(
            code=code,
            title=body.title,
            content=body.content,
            summary=body.summary,
            done=body.done,
            issue=body.issue,
            next_plan=body.next_plan,
            status="draft",
            project_id=body.project_id,
            author_email=author.email,
            author_name=author.display_name,
            work_date=body.work_date or _today(),
        )
        db.add(report)
        try:
            db.commit()
        except IntegrityError:
            db.rollback()
            code = _next_code_after_conflict(code)
            continue
        db.refresh(report)
        return report
    raise IntegrityError("reports.code", {}, None)


def update(db: Session, report: Report, body: ReportUpdate) -> Report:
    for field, value in body.model_dump(exclude_unset=True).items():
        if field == "title" and value is None:
            continue
        setattr(report, field, value)
    db.commit()
    db.refresh(report)
    return report


def submit(db: Session, report: Report) -> Report:
    report.status = "submitted"
    report.submitted_at = _now()
    db.commit()
    db.refresh(report)
    return report


def approve(db: Session, report: Report, comment: Optional[str] = None) -> Report:
    report.status = "approved"
    report.review_comment = comment
    report.reviewed_at = _now()
    db.commit()
    db.refresh(report)
    return report


def reject(db: Session, report: Report, comment: Optional[str] = None) -> Report:
    report.status = "rejected"
    report.review_comment = comment
    report.reviewed_at = _now()
    db.commit()
    db.refresh(report)
    return report


def delete(db: Session, report: Report) -> None:
    db.delete(report)
    db.commit()
