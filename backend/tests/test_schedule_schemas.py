from datetime import date

from pydantic import ValidationError

from app.interfaces.schemas.schedule import ScheduleEventCreate


def test_schedule_event_create_strips_title_and_normalizes_hour():
    event = ScheduleEventCreate(title="  MTMS sync  ", event_date=date(2026, 5, 16), hour="9")

    assert event.title == "MTMS sync"
    assert event.hour == "09"


def test_schedule_event_create_uses_default_hour():
    event = ScheduleEventCreate(title="Standup", event_date=date(2026, 5, 16))

    assert event.hour == "09"


def test_schedule_event_create_rejects_empty_title_invalid_hour_and_unknown_fields():
    for data in [
        {"title": "  ", "event_date": "2026-05-16", "hour": "09"},
        {"title": "Standup", "event_date": "2026-05-16", "hour": "24"},
        {"title": "Standup", "event_date": "2026-05-16", "hour": "-1"},
        {"title": "Standup", "event_date": "2026-05-16", "hour": "9am"},
        {"title": "Standup", "event_date": "2026-05-16", "hour": "09", "unknown": "field"},
    ]:
        try:
            ScheduleEventCreate(**data)
        except ValidationError:
            pass
        else:
            raise AssertionError(f"invalid schedule event data should fail validation: {data}")
