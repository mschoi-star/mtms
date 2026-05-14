"""add project description and report project_id fk

Revision ID: 003
Revises: 002
Create Date: 2026-05-14
"""
from alembic import op
import sqlalchemy as sa
from sqlalchemy.dialects import postgresql

revision = "003"
down_revision = "002"
branch_labels = None
depends_on = None


def upgrade() -> None:
    op.add_column("projects", sa.Column("description", sa.Text(), nullable=True))
    op.add_column("reports", sa.Column("project_id", postgresql.UUID(as_uuid=True), nullable=True))
    op.create_foreign_key(
        "fk_reports_project_id", "reports", "projects", ["project_id"], ["id"],
        ondelete="SET NULL",
    )


def downgrade() -> None:
    op.drop_constraint("fk_reports_project_id", "reports", type_="foreignkey")
    op.drop_column("reports", "project_id")
    op.drop_column("projects", "description")
