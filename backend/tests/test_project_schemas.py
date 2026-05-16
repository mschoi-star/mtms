from pydantic import ValidationError

from app.interfaces.schemas.projects import ProjectCreate, ProjectOut, ProjectUpdate


def test_project_create_normalizes_code_and_strips_name():
    project = ProjectCreate(code=" prj-001 ", name=" MTMS 구축 ")

    assert project.code == "PRJ-001"
    assert project.name == "MTMS 구축"


def test_project_create_allows_missing_or_blank_code_for_auto_generation():
    assert ProjectCreate(name="MTMS 구축").code is None
    assert ProjectCreate(code="  ", name="MTMS 구축").code is None


def test_project_create_rejects_invalid_status_and_progress():
    for data in [
        {"code": "PRJ-001", "name": "MTMS", "status": "waiting"},
        {"code": "PRJ-001", "name": "MTMS", "progress": -1},
        {"code": "PRJ-001", "name": "MTMS", "progress": 101},
        {"code": "PRJ-001", "name": "MTMS", "team": "x" * 51},
    ]:
        try:
            ProjectCreate(**data)
        except ValidationError:
            pass
        else:
            raise AssertionError(f"invalid project data should fail validation: {data}")


def test_project_create_rejects_empty_code_name_and_unknown_fields():
    for data in [
        {"name": "  "},
        {"code": "PRJ-001", "name": "  "},
        {"code": "PRJ-001", "name": "MTMS", "unknown": "field"},
    ]:
        try:
            ProjectCreate(**data)
        except ValidationError:
            pass
        else:
            raise AssertionError(f"invalid project data should fail validation: {data}")


def test_project_update_ignores_null_non_nullable_fields_when_dumping():
    update = ProjectUpdate(name=None, progress=None)

    assert update.model_dump(exclude_none=True) == {}


def test_project_update_rejects_invalid_values_and_unknown_fields():
    for data in [
        {"name": "  "},
        {"progress": 101},
        {"team": "x" * 51},
        {"status": "waiting"},
        {"unexpected": "field"},
    ]:
        try:
            ProjectUpdate(**data)
        except ValidationError:
            pass
        else:
            raise AssertionError(f"invalid project update should fail validation: {data}")


def test_project_out_rejects_invalid_status_from_persistence():
    try:
        ProjectOut(
            id="00000000-0000-0000-0000-000000000001",
            code="PRJ-001",
            name="MTMS",
            team="Eng",
            progress=100,
            status="closed",
            created_at="2026-05-15T00:00:00Z",
            updated_at="2026-05-15T00:00:00Z",
        )
    except ValidationError:
        pass
    else:
        raise AssertionError("ProjectOut should reject statuses outside the frontend contract")