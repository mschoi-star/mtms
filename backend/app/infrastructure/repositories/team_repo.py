from sqlalchemy.orm import Session
from app.infrastructure.database.models import TeamMember


def get_all(db: Session) -> list[TeamMember]:
    return db.query(TeamMember).order_by(TeamMember.name).all()
