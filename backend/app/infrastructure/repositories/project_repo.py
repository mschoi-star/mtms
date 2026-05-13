from uuid import UUID
from typing import Optional
from sqlalchemy.orm import Session
from app.infrastructure.database.models import Project
from app.interfaces.schemas.projects import ProjectCreate, ProjectUpdate


def get_all(db: Session) -> list[Project]:
    return db.query(Project).order_by(Project.code).all()


def get_by_id(db: Session, project_id: UUID) -> Optional[Project]:
    return db.query(Project).filter(Project.id == project_id).first()


def create(db: Session, data: ProjectCreate) -> Project:
    project = Project(**data.model_dump())
    db.add(project)
    db.commit()
    db.refresh(project)
    return project


def update(db: Session, project: Project, data: ProjectUpdate) -> Project:
    for field, value in data.model_dump(exclude_none=True).items():
        setattr(project, field, value)
    db.commit()
    db.refresh(project)
    return project


def delete(db: Session, project: Project) -> None:
    db.delete(project)
    db.commit()
