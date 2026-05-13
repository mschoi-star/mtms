from sqlalchemy.orm import Session
from app.infrastructure.database.models import FileEntry


def get_entries(db: Session, path: str = "/") -> list[FileEntry]:
    prefix = path.rstrip("/") + "/"   # "/" → "/"  |  "/projects" → "/projects/"
    return (
        db.query(FileEntry)
        .filter(
            FileEntry.path.like(f"{prefix}%"),
            ~FileEntry.path.like(f"{prefix}%/%"),
        )
        .order_by(FileEntry.entry_type.desc(), FileEntry.name)
        .all()
    )
