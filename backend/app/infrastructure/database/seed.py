from datetime import date
from sqlalchemy.orm import Session
from app.core.security import hash_password
from app.infrastructure.database.models import (
    User, Project, Report, ScheduleEvent, Message, TeamMember, FileEntry,
)


def seed(db: Session) -> None:
    if db.query(User).count() > 0:
        return

    users = [
        User(email="kim.s@mpse-cae.com",  display_name="Kim Soo-jin",   hashed_password=hash_password("password"), department="Engineering", role="Lead Engineer",    status="online"),
        User(email="lee.j@mpse-cae.com",  display_name="Lee Joon",      hashed_password=hash_password("password"), department="QA",          role="QA Specialist",   status="online"),
        User(email="park.h@mpse-cae.com", display_name="Park Hye-rin",  hashed_password=hash_password("password"), department="R&D",         role="Reliability Lead", status="idle"),
        User(email="choi.m@mpse-cae.com", display_name="Choi Min-woo",  hashed_password=hash_password("password"), department="Engineering", role="Solver Engineer", status="online"),
        User(email="han.b@mpse-cae.com",  display_name="Han Bora",      hashed_password=hash_password("password"), department="Operations",  role="Ops Manager",     status="offline"),
        User(email="jung.t@mpse-cae.com", display_name="Jung Tae-hyun", hashed_password=hash_password("password"), department="Design",      role="Designer",        status="online"),
    ]
    db.add_all(users)

    projects = [
        Project(code="PRJ-204", name="CAE postprocessor v3",   team="Eng", progress=82,  status="in review"),
        Project(code="PRJ-219", name="Meshing benchmarks",     team="QA",  progress=34,  status="active"),
        Project(code="PRJ-201", name="Solver migration",       team="Eng", progress=68,  status="active"),
        Project(code="PRJ-188", name="Topology optimization",  team="R&D", progress=91,  status="in review"),
        Project(code="PRJ-176", name="Field equation library", team="R&D", progress=100, status="complete"),
        Project(code="PRJ-211", name="Cluster scheduler",      team="Ops", progress=22,  status="active"),
    ]
    db.add_all(projects)

    reports = [
        Report(code="RPT-118", title="Q2 reliability summary", status="approved"),
        Report(code="RPT-117", title="Cluster utilization",    status="approved"),
        Report(code="RPT-116", title="Solver regression",      status="draft"),
        Report(code="RPT-115", title="Vendor compliance",      status="draft"),
    ]
    db.add_all(reports)

    events = [
        ScheduleEvent(title="Standup",           event_date=date(2026, 5, 11), hour="09"),
        ScheduleEvent(title="Review · PRJ-204",  event_date=date(2026, 5, 13), hour="10"),
        ScheduleEvent(title="MTMS sync",         event_date=date(2026, 5, 13), hour="14"),
        ScheduleEvent(title="Vendor call",       event_date=date(2026, 5, 14), hour="11"),
        ScheduleEvent(title="Standup",           event_date=date(2026, 5, 15), hour="09"),
        ScheduleEvent(title="Sprint close",      event_date=date(2026, 5, 15), hour="16"),
    ]
    db.add_all(events)

    messages = [
        Message(
            sender_name="Kim S.", sender_email="kim.s@mpse-cae.com",
            subject="Re: PRJ-204 review", is_unread=True,
            body=(
                "The postprocessor v3 build passes all regression suites. "
                "Two minor findings flagged in the validation log — both already triaged to the next iteration.\n\n"
                "Requesting final review sign-off so we can promote to release branch before Friday's sprint close."
            ),
        ),
        Message(sender_name="Lee J.",  sender_email="lee.j@mpse-cae.com",  subject="Meshing benchmark plan",       is_unread=True,  body=""),
        Message(sender_name="Park H.", sender_email="park.h@mpse-cae.com", subject="RPT-118 approval signed off",  is_unread=False, body=""),
        Message(sender_name="Choi M.", sender_email="choi.m@mpse-cae.com", subject="Comments on solver migration", is_unread=False, body=""),
        Message(sender_name="Han B.",  sender_email="han.b@mpse-cae.com",  subject="Cluster maintenance window",   is_unread=False, body=""),
    ]
    db.add_all(messages)

    members = [
        TeamMember(name="Kim Soo-jin",   role="Lead Engineer",    department="Engineering", status="online",  email="kim.s@mpse-cae.com"),
        TeamMember(name="Lee Joon",      role="QA Specialist",    department="QA",          status="online",  email="lee.j@mpse-cae.com"),
        TeamMember(name="Park Hye-rin",  role="Reliability Lead", department="R&D",         status="idle",    email="park.h@mpse-cae.com"),
        TeamMember(name="Choi Min-woo",  role="Solver Engineer",  department="Engineering", status="online",  email="choi.m@mpse-cae.com"),
        TeamMember(name="Han Bora",      role="Ops Manager",      department="Operations",  status="offline", email="han.b@mpse-cae.com"),
        TeamMember(name="Jung Tae-hyun", role="Designer",         department="Design",      status="online",  email="jung.t@mpse-cae.com"),
    ]
    db.add_all(members)

    files = [
        FileEntry(entry_type="dir",  name="projects",     path="/projects",     size_label="—",      modified_at=date(2026, 5, 13)),
        FileEntry(entry_type="dir",  name="reports",      path="/reports",      size_label="—",      modified_at=date(2026, 5, 12)),
        FileEntry(entry_type="dir",  name="datasets",     path="/datasets",     size_label="—",      modified_at=date(2026, 5, 11)),
        FileEntry(entry_type="file", name="manifest.toml", path="/manifest.toml",size_label="3 KB",   modified_at=date(2026, 5, 13)),
        FileEntry(entry_type="file", name="readme.md",     path="/readme.md",    size_label="12 KB",  modified_at=date(2026, 5, 10)),
        FileEntry(entry_type="file", name="log.txt",       path="/log.txt",      size_label="420 KB", modified_at=date(2026, 5, 13)),
    ]
    db.add_all(files)

    db.commit()
