from uuid import UUID
from typing import Optional
from fastapi import APIRouter, Depends, HTTPException, Query, status
from sqlalchemy.orm import Session
from app.infrastructure.database.session import get_db
from app.infrastructure.database.models import User
from app.core.deps import get_current_user
from app.infrastructure.repositories import report_repo
from app.interfaces.schemas.reports import ReportCreate, ReportOut

router = APIRouter(prefix="/reports", tags=["reports"])


@router.get("", response_model=list[ReportOut])
def list_reports(
    project_id: Optional[UUID] = Query(None),
    db: Session = Depends(get_db),
    _: User = Depends(get_current_user),
):
    return report_repo.get_all(db, project_id=project_id)


@router.post("", response_model=ReportOut, status_code=status.HTTP_201_CREATED)
def create_report(body: ReportCreate, db: Session = Depends(get_db), _: User = Depends(get_current_user)):
    return report_repo.create(db, title=body.title, content=body.content, project_id=body.project_id)


@router.get("/{report_id}", response_model=ReportOut)
def get_report(report_id: UUID, db: Session = Depends(get_db), _: User = Depends(get_current_user)):
    report = report_repo.get_by_id(db, report_id)
    if not report:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Report not found")
    return report
