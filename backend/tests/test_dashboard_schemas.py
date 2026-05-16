from app.interfaces.schemas.dashboard import DashboardActivity, DashboardStat, DashboardSummary, TeamCapacity


def test_dashboard_summary_schema_contains_live_sections():
    summary = DashboardSummary(
        stats=[DashboardStat(key="ACTIVE", value=3, suffix="projects")],
        capacity=[TeamCapacity(label="CAE", value=75)],
        activities=[DashboardActivity(time="09:30", actor="Choi M.", action="approved", target="RPT-001")],
    )

    assert summary.stats[0].key == "ACTIVE"
    assert summary.capacity[0].value == 75
    assert summary.activities[0].target == "RPT-001"
