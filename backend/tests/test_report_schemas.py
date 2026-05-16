from datetime import date
from uuid import uuid4

from pydantic import ValidationError

from app.interfaces.schemas.reports import ReportCreate, ReportUpdate, ReportOut


def test_report_create_supports_structured_daily_work_fields():
    project_id = uuid4()

    report = ReportCreate(
        title="CAE 솔버 일일업무",
        project_id=project_id,
        work_date=date(2026, 5, 14),
        summary="벤치마크 결과 정리",
        done="성능 회귀 테스트를 완료했습니다.",
        issue="대형 메시 케이스에서 시간이 증가했습니다.",
        next_plan="원인 프로파일링을 진행합니다.",
    )

    assert report.project_id == project_id
    assert report.work_date == date(2026, 5, 14)
    assert report.summary == "벤치마크 결과 정리"
    assert report.done.startswith("성능")
    assert report.issue.startswith("대형")
    assert report.next_plan.startswith("원인")


def test_report_update_rejects_unknown_status():
    try:
        ReportUpdate(status="waiting")
    except ValidationError as exc:
        assert "status" in str(exc)
    else:
        raise AssertionError("invalid status should fail validation")


def test_report_out_contains_review_workflow_fields():
    fields = ReportOut.model_fields

    for name in [
        "author_email",
        "author_name",
        "work_date",
        "summary",
        "done",
        "issue",
        "next_plan",
        "review_comment",
        "submitted_at",
        "reviewed_at",
    ]:
        assert name in fields
