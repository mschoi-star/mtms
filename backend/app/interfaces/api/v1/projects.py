from uuid import UUID
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.exc import IntegrityError
from sqlalchemy.orm import Session
from app.infrastructure.database.session import get_db
from app.infrastructure.database.models import User
from app.core.deps import get_current_user
from app.infrastructure.repositories import project_repo
from app.interfaces.schemas.projects import ProjectOut, ProjectCreate, ProjectUpdate

router = APIRouter(prefix="/projects", tags=["projects"])


@router.get("", response_model=list[ProjectOut])
def list_projects(db: Session = Depends(get_db), _: User = Depends(get_current_user)):
    return project_repo.get_all(db)


@router.get("/{project_id}", response_model=ProjectOut)
def get_project(project_id: UUID, db: Session = Depends(get_db), _: User = Depends(get_current_user)):
    project = project_repo.get_by_id(db, project_id)
    if not project:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Project not found")
    return project


@router.post("", response_model=ProjectOut, status_code=status.HTTP_201_CREATED)
def create_project(body: ProjectCreate, db: Session = Depends(get_db), _: User = Depends(get_current_user)):
    code = body.code or project_repo.next_code(db)
    if project_repo.get_by_code(db, code):
        raise HTTPException(status_code=status.HTTP_409_CONFLICT, detail="Project code already exists")
    try:
        return project_repo.create(db, body.model_copy(update={"code": code}))
    except IntegrityError as exc:
        db.rollback()
        raise HTTPException(status_code=status.HTTP_409_CONFLICT, detail="Project code already exists") from exc


@router.patch("/{project_id}", response_model=ProjectOut)
def update_project(project_id: UUID, body: ProjectUpdate, db: Session = Depends(get_db), _: User = Depends(get_current_user)):
    project = project_repo.get_by_id(db, project_id)
    if not project:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Project not found")
    return project_repo.update(db, project, body)


@router.delete("/{project_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_project(project_id: UUID, db: Session = Depends(get_db), _: User = Depends(get_current_user)):
    project = project_repo.get_by_id(db, project_id)
    if not project:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Project not found")
    project_repo.delete(db, project)
