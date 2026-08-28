from datetime import date, timedelta

import pytest

from app.repositories.data_manager import data_manager


@pytest.fixture
def isolated_finances(monkeypatch):
    monkeypatch.setattr(
        data_manager,
        "accounts",
        [
            {
                "id": 1001,
                "user_id": 1,
                "name": "Checking",
                "account_type": "checking",
                "balance": 1000.0,
                "is_active": True,
            },
            {
                "id": 1002,
                "user_id": 1,
                "name": "Savings",
                "account_type": "savings",
                "balance": 500.0,
                "is_active": True,
            },
        ],
    )
    monkeypatch.setattr(data_manager, "recurring_rules", [])
    monkeypatch.setattr(data_manager, "subscriptions", [])


def test_safe_to_spend_projects_bills_and_income(
    client, auth_headers, isolated_finances
):
    today = date.today()
    data_manager.recurring_rules.append(
        {
            "id": 2001,
            "user_id": 1,
            "name": "Rent",
            "amount": 100.0,
            "transaction_type": "debit",
            "frequency": "monthly",
            "day_of_month": today.day,
            "start_date": today,
            "next_occurrence": today + timedelta(days=5),
            "is_active": True,
        }
    )
    data_manager.recurring_rules.append(
        {
            "id": 2002,
            "user_id": 1,
            "name": "Paycheck",
            "amount": 200.0,
            "transaction_type": "credit",
            "frequency": "monthly",
            "day_of_month": today.day,
            "start_date": today,
            "next_occurrence": today + timedelta(days=10),
            "is_active": True,
        }
    )
    data_manager.subscriptions.append(
        {
            "id": 3001,
            "user_id": 1,
            "name": "Streaming Subscription",
            "merchant_name": "Streaming",
            "amount": 25.0,
            "status": "active",
            "next_billing_date": today + timedelta(days=2),
        }
    )

    response = client.get("/api/safe-to-spend", headers=auth_headers)

    assert response.status_code == 200
    payload = response.json()
    assert payload["liquid_balance"] == 1500.0
    assert payload["total_upcoming"] == 125.0
    assert payload["days_until_next_income"] == 10
    assert payload["safe_to_spend"] == 1375.0
    assert payload["safe_per_day"] == 137.5
    assert [bill["source"] for bill in payload["upcoming_bills"]] == [
        "subscription",
        "recurring",
    ]


def test_safe_to_spend_handles_no_bills(client, auth_headers, isolated_finances):
    data_manager.accounts[0]["balance"] = 250.0
    data_manager.accounts[1]["balance"] = 0.0

    response = client.get("/api/safe-to-spend", headers=auth_headers)

    assert response.status_code == 200
    payload = response.json()
    assert payload["upcoming_bills"] == []
    assert payload["total_upcoming"] == 0.0
    assert payload["days_until_next_income"] == 30
    assert payload["safe_to_spend"] == 250.0
    assert payload["safe_per_day"] == pytest.approx(8.33, abs=0.01)
