"""add content column to reports

Revision ID: 002
Revises: 001
Create Date: 2026-05-14
"""
from alembic import op
import sqlalchemy as sa

revision = "002"
down_revision = "001"
branch_labels = None
depends_on = None


def upgrade() -> None:
    op.add_column("reports", sa.Column("content", sa.Text(), nullable=True))


def downgrade() -> None:
    op.drop_column("reports", "content")
