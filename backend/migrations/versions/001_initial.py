"""initial schema — 7 tables

Revision ID: 001
Revises:
Create Date: 2026-05-13
"""
from alembic import op
import sqlalchemy as sa
from sqlalchemy.dialects import postgresql

revision = "001"
down_revision = None
branch_labels = None
depends_on = None


def upgrade() -> None:
    # ── users ──────────────────────────────────────────────────────
    op.create_table(
        "users",
        sa.Column(
            "id",
            postgresql.UUID(as_uuid=True),
            primary_key=True,
            server_default=sa.text("gen_random_uuid()"),
        ),
        sa.Column("email",           sa.String(255), nullable=False),
        sa.Column("display_name",    sa.String(100), nullable=False),
        sa.Column("hashed_password", sa.String(255), nullable=False),
        sa.Column("department",      sa.String(100), nullable=True, server_default=""),
        sa.Column("role",            sa.String(100), nullable=True, server_default=""),
        sa.Column("status",          sa.String(20),  nullable=True, server_default="offline"),
        sa.Column(
            "created_at",
            sa.DateTime(timezone=True),
            nullable=True,
            server_default=sa.text("now()"),
        ),
    )
    op.create_index("ix_users_email", "users", ["email"], unique=True)

    # ── projects ───────────────────────────────────────────────────
    op.create_table(
        "projects",
        sa.Column(
            "id",
            postgresql.UUID(as_uuid=True),
            primary_key=True,
            server_default=sa.text("gen_random_uuid()"),
        ),
        sa.Column("code",     sa.String(20),  nullable=False),
        sa.Column("name",     sa.String(200), nullable=False),
        sa.Column("team",     sa.String(50),  nullable=True, server_default=""),
        sa.Column("progress", sa.Integer(),   nullable=True, server_default="0"),
        sa.Column("status",   sa.String(30),  nullable=True, server_default="active"),
        sa.Column(
            "created_at",
            sa.DateTime(timezone=True),
            nullable=True,
            server_default=sa.text("now()"),
        ),
        sa.Column(
            "updated_at",
            sa.DateTime(timezone=True),
            nullable=True,
            server_default=sa.text("now()"),
        ),
        sa.UniqueConstraint("code", name="uq_projects_code"),
    )

    # ── reports ────────────────────────────────────────────────────
    op.create_table(
        "reports",
        sa.Column(
            "id",
            postgresql.UUID(as_uuid=True),
            primary_key=True,
            server_default=sa.text("gen_random_uuid()"),
        ),
        sa.Column("code",   sa.String(20),  nullable=False),
        sa.Column("title",  sa.String(200), nullable=False),
        sa.Column("status", sa.String(20),  nullable=True, server_default="draft"),
        sa.Column(
            "created_at",
            sa.DateTime(timezone=True),
            nullable=True,
            server_default=sa.text("now()"),
        ),
        sa.UniqueConstraint("code", name="uq_reports_code"),
    )

    # ── schedule_events ────────────────────────────────────────────
    op.create_table(
        "schedule_events",
        sa.Column(
            "id",
            postgresql.UUID(as_uuid=True),
            primary_key=True,
            server_default=sa.text("gen_random_uuid()"),
        ),
        sa.Column("title",      sa.String(200), nullable=False),
        sa.Column("event_date", sa.Date(),      nullable=False),
        sa.Column("hour",       sa.String(5),   nullable=True, server_default="09"),
        sa.Column(
            "created_at",
            sa.DateTime(timezone=True),
            nullable=True,
            server_default=sa.text("now()"),
        ),
    )

    # ── messages ───────────────────────────────────────────────────
    op.create_table(
        "messages",
        sa.Column(
            "id",
            postgresql.UUID(as_uuid=True),
            primary_key=True,
            server_default=sa.text("gen_random_uuid()"),
        ),
        sa.Column("sender_name",  sa.String(100), nullable=False),
        sa.Column("sender_email", sa.String(255), nullable=False),
        sa.Column("subject",      sa.String(300), nullable=False),
        sa.Column("body",         sa.Text(),      nullable=True, server_default=""),
        sa.Column("is_unread",    sa.Boolean(),   nullable=True, server_default="true"),
        sa.Column(
            "sent_at",
            sa.DateTime(timezone=True),
            nullable=True,
            server_default=sa.text("now()"),
        ),
    )

    # ── team_members ───────────────────────────────────────────────
    op.create_table(
        "team_members",
        sa.Column(
            "id",
            postgresql.UUID(as_uuid=True),
            primary_key=True,
            server_default=sa.text("gen_random_uuid()"),
        ),
        sa.Column("name",       sa.String(100), nullable=False),
        sa.Column("role",       sa.String(100), nullable=True, server_default=""),
        sa.Column("department", sa.String(100), nullable=True, server_default=""),
        sa.Column("status",     sa.String(20),  nullable=True, server_default="offline"),
        sa.Column("email",      sa.String(255), nullable=True, server_default=""),
    )

    # ── file_entries ───────────────────────────────────────────────
    op.create_table(
        "file_entries",
        sa.Column(
            "id",
            postgresql.UUID(as_uuid=True),
            primary_key=True,
            server_default=sa.text("gen_random_uuid()"),
        ),
        sa.Column("entry_type",  sa.String(10),  nullable=True, server_default="file"),
        sa.Column("name",        sa.String(255), nullable=False),
        sa.Column("path",        sa.String(500), nullable=False),
        sa.Column("size_label",  sa.String(20),  nullable=True, server_default="—"),
        sa.Column("modified_at", sa.Date(),      nullable=True),
    )


def downgrade() -> None:
    op.drop_table("file_entries")
    op.drop_table("team_members")
    op.drop_table("messages")
    op.drop_table("schedule_events")
    op.drop_table("reports")
    op.drop_table("projects")
    op.drop_index("ix_users_email", table_name="users")
    op.drop_table("users")
