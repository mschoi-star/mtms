"""constrain project status and progress

Revision ID: 005
Revises: 004
Create Date: 2026-05-15
"""
from alembic import op

revision = "005"
down_revision = "004"
branch_labels = None
depends_on = None

ALLOWED_STATUSES = "'active', 'in review', 'on hold', 'complete'"


def upgrade() -> None:
    op.execute("UPDATE projects SET status = 'complete' WHERE status = 'closed'")
    op.execute("UPDATE projects SET progress = 0 WHERE progress < 0")
    op.execute("UPDATE projects SET progress = 100 WHERE progress > 100")
    op.create_check_constraint(
        "ck_projects_status_allowed",
        "projects",
        f"status IN ({ALLOWED_STATUSES})",
    )
    op.create_check_constraint(
        "ck_projects_progress_range",
        "projects",
        "progress >= 0 AND progress <= 100",
    )


def downgrade() -> None:
    op.drop_constraint("ck_projects_progress_range", "projects", type_="check")
    op.drop_constraint("ck_projects_status_allowed", "projects", type_="check")
