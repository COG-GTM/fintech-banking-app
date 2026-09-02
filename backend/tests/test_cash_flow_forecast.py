from datetime import date, timedelta

from app.services.cash_flow_forecast import build_cash_flow_forecast


def test_forecast_without_scheduled_events():
    today = date(2025, 1, 1)
    forecast = build_cash_flow_forecast(
        starting_balance=1000,
        subscriptions=[],
        recurring_rules=[],
        avg_daily_spend=10,
        avg_daily_income=0,
        days=30,
        today=today,
    )

    assert len(forecast["daily_projection"]) == 31
    assert forecast["projected_end_balance"] == 700
    assert forecast["lowest_balance"] == 700
    assert forecast["lowest_balance_date"] == "2025-01-31"
    assert forecast["alerts"] == []
    assert forecast["safe_to_spend"] == 600
    assert forecast["buffer"] == 100


def test_monthly_subscription_occurs_three_times_in_ninety_days():
    today = date(2025, 1, 1)
    forecast = build_cash_flow_forecast(
        starting_balance=1000,
        subscriptions=[{
            "name": "Streaming",
            "amount": 50,
            "billing_cycle": "monthly",
            "next_billing_date": today + timedelta(days=5),
        }],
        recurring_rules=[],
        avg_daily_spend=0,
        avg_daily_income=0,
        days=90,
        today=today,
    )

    assert len(forecast["upcoming_events"]) == 3
    assert forecast["total_scheduled_outflow"] == 150
    assert all(event["source"] == "subscription" for event in forecast["upcoming_events"])


def test_weekly_subscription_generates_buffer_and_negative_alerts_once():
    today = date(2025, 1, 1)
    forecast = build_cash_flow_forecast(
        starting_balance=250,
        subscriptions=[{
            "name": "Weekly bill",
            "amount": 100,
            "billing_cycle": "weekly",
            "next_billing_date": today + timedelta(days=1),
        }],
        recurring_rules=[],
        avg_daily_spend=0,
        avg_daily_income=0,
        days=30,
        today=today,
    )

    assert [alert["type"] for alert in forecast["alerts"]] == [
        "below_buffer",
        "negative_balance",
    ]
    assert forecast["safe_to_spend"] == 0


def test_subscription_without_next_billing_date_is_skipped():
    forecast = build_cash_flow_forecast(
        starting_balance=500,
        subscriptions=[{
            "name": "Missing date",
            "amount": 100,
            "billing_cycle": "monthly",
            "next_billing_date": None,
        }],
        recurring_rules=[],
        avg_daily_spend=0,
        avg_daily_income=0,
        days=30,
        today=date(2025, 1, 1),
    )

    assert forecast["upcoming_events"] == []
    assert forecast["total_scheduled_outflow"] == 0


def test_cash_flow_forecast_endpoint(client, auth_headers):
    response = client.get(
        "/api/analytics/cash-flow/forecast?days=30",
        headers=auth_headers,
    )

    assert response.status_code == 200
    payload = response.json()
    assert {
        "days",
        "start_date",
        "end_date",
        "starting_balance",
        "projected_end_balance",
        "lowest_balance",
        "lowest_balance_date",
        "safe_to_spend",
        "buffer",
        "avg_daily_spend",
        "avg_daily_income",
        "total_scheduled_outflow",
        "upcoming_events",
        "daily_projection",
        "alerts",
    }.issubset(payload)
    assert len(payload["daily_projection"]) == 31
    assert payload["daily_projection"][0]["balance"] == payload["starting_balance"]

    invalid = client.get(
        "/api/analytics/cash-flow/forecast?days=5",
        headers=auth_headers,
    )
    assert invalid.status_code == 422
