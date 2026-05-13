from fastapi import APIRouter
from app.interfaces.api.v1 import auth, projects, reports, schedule, inbox, team, files

router = APIRouter()

router.include_router(auth.router)
router.include_router(projects.router)
router.include_router(reports.router)
router.include_router(schedule.router)
router.include_router(inbox.router)
router.include_router(team.router)
router.include_router(files.router)
