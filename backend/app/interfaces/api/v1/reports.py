from uuid import UUID
from typing import Optional
from fastapi import APIRouter, Depends, HTTPException, Query, status
from sqlalchemy.orm import Session
from app.infrastructure.database.session import get_db
from app.infrastructure.database.models import Project, User
from app.core.deps import get_current_user
from app.infrastructure.repositories import report_repo
from app.interfaces.schemas.reports import ReportCreate, ReportOut, ReportReview, ReportUpdate

router = APIRouter(prefix="/reports", tags=["reports"])


def _get_report_or_404(report_id: UUID, db: Session):
    report = report_repo.get_by_id(db, report_id)
    if not report:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Report not found")
    return report


def _ensure_project_exists(db: Session, project_id: UUID | None) -> None:
    if project_id and not db.query(Project.id).filter(Project.id == project_id).first():
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Project not found")


def _ensure_report_author(report, current_user: User) -> None:
    if report.author_email != current_user.email:
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Only the report author can change this report")


def _ensure_editable(report) -> None:
    if report.status not in {"draft", "rejected"}:
        raise HTTPException(status_code=status.HTTP_409_CONFLICT, detail="Only draft or rejected reports can be edited")


@router.get("", response_model=list[ReportOut])
def list_reports(
    project_id: Optional[UUID] = Query(None),
    db: Session = Depends(get_db),
    _: User = Depends(get_current_user),
):
    return report_repo.get_all(db, project_id=project_id)


@router.post("", response_model=ReportOut, status_code=status.HTTP_201_CREATED)
def create_report(
    body: ReportCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    _ensure_project_exists(db, body.project_id)
    return report_repo.create(db, body=body, author=current_user)


@router.get("/{report_id}", response_model=ReportOut)
def get_report(report_id: UUID, db: Session = Depends(get_db), _: User = Depends(get_current_user)):
    return _get_report_or_404(report_id, db)


@router.patch("/{report_id}", response_model=ReportOut)
def update_report(
    report_id: UUID,
    body: ReportUpdate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    report = _get_report_or_404(report_id, db)
    _ensure_report_author(report, current_user)
    _ensure_editable(report)
    _ensure_project_exists(db, body.project_id)
    return report_repo.update(db, report, body)


@router.delete("/{report_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_report(report_id: UUID, db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    report = _get_report_or_404(report_id, db)
    _ensure_report_author(report, current_user)
    _ensure_editable(report)
    report_repo.delete(db, report)


@router.post("/{report_id}/submit", response_model=ReportOut)
def submit_report(report_id: UUID, db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    report = _get_report_or_404(report_id, db)
    _ensure_report_author(report, current_user)
    if report.status not in {"draft", "rejected"}:
        raise HTTPException(status_code=status.HTTP_409_CONFLICT, detail="Only draft or rejected reports can be submitted")
    return report_repo.submit(db, report)


@router.post("/{report_id}/approve", response_model=ReportOut)
def approve_report(
    report_id: UUID,
    body: ReportReview | None = None,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    report = _get_report_or_404(report_id, db)
    if report.status != "submitted":
        raise HTTPException(status_code=status.HTTP_409_CONFLICT, detail="Only submitted reports can be approved")
    if report.author_email == current_user.email:
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Authors cannot approve their own reports")
    return report_repo.approve(db, report, comment=body.comment if body else None)


@router.post("/{report_id}/reject", response_model=ReportOut)
def reject_report(
    report_id: UUID,
    body: ReportReview | None = None,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    report = _get_report_or_404(report_id, db)
    if report.status != "submitted":
        raise HTTPException(status_code=status.HTTP_409_CONFLICT, detail="Only submitted reports can be rejected")
    if report.author_email == current_user.email:
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Authors cannot reject their own reports")
    return report_repo.reject(db, report, comment=body.comment if body else None)
