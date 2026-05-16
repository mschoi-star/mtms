from datetime import date

from fastapi import APIRouter, Depends
from sqlalchemy import func
from sqlalchemy.orm import Session

from app.core.deps import get_current_user
from app.infrastructure.database.models import Message, Project, Report, User
from app.infrastructure.database.session import get_db
from app.interfaces.schemas.dashboard import DashboardActivity, DashboardStat, DashboardSummary, TeamCapacity

router = APIRouter(prefix="/dashboard", tags=["dashboard"])


def _pct(part: int, total: int) -> int:
    if total <= 0:
        return 0
    return min(100, max(0, round((part / total) * 100)))


@router.get("/summary", response_model=DashboardSummary)
def get_dashboard_summary(db: Session = Depends(get_db), _: User = Depends(get_current_user)):
    total_projects = db.query(func.count(Project.id)).scalar() or 0
    active_projects = db.query(func.count(Project.id)).filter(Project.status == "active").scalar() or 0
    pending_reports = db.query(func.count(Report.id)).filter(Report.status == "submitted").scalar() or 0
    unread_messages = db.query(func.count(Message.id)).filter(Message.is_unread.is_(True)).scalar() or 0
    today_reports = db.query(func.count(Report.id)).filter(Report.work_date == date.today()).scalar() or 0

    stats = [
        DashboardStat(key="ACTIVE", value=active_projects, suffix="projects"),
        DashboardStat(key="PENDING", value=pending_reports, suffix="reports"),
        DashboardStat(key="UNREAD", value=unread_messages, suffix="messages"),
        DashboardStat(key="TODAY", value=today_reports, suffix="reports"),
    ]

    team_rows = (
        db.query(Project.team, func.count(Project.id))
        .filter(Project.team != "")
        .group_by(Project.team)
        .order_by(Project.team)
        .all()
    )
    capacity = [TeamCapacity(label=team or "Unassigned", value=_pct(count, total_projects)) for team, count in team_rows]

    report_activities = (
        db.query(Report)
        .order_by(Report.created_at.desc())
        .limit(4)
        .all()
    )
    activities = [
        DashboardActivity(
            time=report.created_at.strftime("%H:%M") if report.created_at else "--:--",
            actor=report.author_name or report.author_email or "Unknown",
            action=report.status,
            target=f"{report.code} · {report.title}",
        )
        for report in report_activities
    ]

    if len(activities) < 4:
        project_activities = (
            db.query(Project)
            .order_by(Project.updated_at.desc())
            .limit(4 - len(activities))
            .all()
        )
        activities.extend(
            DashboardActivity(
                time=project.updated_at.strftime("%H:%M") if project.updated_at else "--:--",
                actor=project.team or "Project",
                action=project.status,
                target=f"{project.code} · {project.name}",
            )
            for project in project_activities
        )

    return DashboardSummary(stats=stats, capacity=capacity, activities=activities)
