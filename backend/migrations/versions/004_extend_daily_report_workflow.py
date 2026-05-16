"""extend daily report workflow fields

Revision ID: 004
Revises: 003
Create Date: 2026-05-14
"""
from alembic import op
import sqlalchemy as sa

revision = "004"
down_revision = "003"
branch_labels = None
depends_on = None


def upgrade() -> None:
    op.add_column("reports", sa.Column("summary", sa.Text(), nullable=True))
    op.add_column("reports", sa.Column("done", sa.Text(), nullable=True))
    op.add_column("reports", sa.Column("issue", sa.Text(), nullable=True))
    op.add_column("reports", sa.Column("next_plan", sa.Text(), nullable=True))
    op.add_column("reports", sa.Column("author_email", sa.String(length=255), nullable=True))
    op.add_column("reports", sa.Column("author_name", sa.String(length=100), nullable=True))
    op.add_column("reports", sa.Column("work_date", sa.Date(), nullable=True))
    op.add_column("reports", sa.Column("review_comment", sa.Text(), nullable=True))
    op.add_column("reports", sa.Column("submitted_at", sa.DateTime(timezone=True), nullable=True))
    op.add_column("reports", sa.Column("reviewed_at", sa.DateTime(timezone=True), nullable=True))


def downgrade() -> None:
    op.drop_column("reports", "reviewed_at")
    op.drop_column("reports", "submitted_at")
    op.drop_column("reports", "review_comment")
    op.drop_column("reports", "work_date")
    op.drop_column("reports", "author_name")
    op.drop_column("reports", "author_email")
    op.drop_column("reports", "next_plan")
    op.drop_column("reports", "issue")
    op.drop_column("reports", "done")
    op.drop_column("reports", "summary")
