"""Cash-flow forecasting calculations."""

from datetime import date, datetime, timedelta
from typing import Any

from dateutil.relativedelta import relativedelta


def _value(item: Any, key: str, default: Any = None) -> Any:
    if isinstance(item, dict):
        return item.get(key, default)
    return getattr(item, key, default)


def _as_date(value: Any) -> date | None:
    if isinstance(value, datetime):
        value = value.date()
    if isinstance(value, date):
        return value
    if isinstance(value, str):
        try:
            return date.fromisoformat(value[:10])
        except ValueError:
            return None
    return None


def _cycle_step(cycle: Any) -> tuple[str, int]:
    value = getattr(cycle, "value", cycle)
    normalized = str(value or "").lower().replace("-", "_")
    if normalized == "daily":
        return "days", 1
    if normalized == "weekly":
        return "days", 7
    if normalized == "monthly":
        return "months", 1
    if normalized == "quarterly":
        return "months", 3
    if normalized in {"semi_annual", "semiannual"}:
        return "months", 6
    if normalized in {"annual", "yearly"}:
        return "years", 1
    return "days", 30


def _next_occurrence(current: date, unit: str, amount: int) -> date:
    if unit == "days":
        return current + timedelta(days=amount)
    if unit == "months":
        return current + relativedelta(months=amount)
    return current + relativedelta(years=amount)


def _event_occurrences(
    items: list[dict],
    *,
    date_key: str,
    cycle_key: str,
    horizon_end: date,
    source: str,
) -> list[dict]:
    events = []
    for item in items:
        current = _as_date(_value(item, date_key))
        if current is None:
            continue
        unit, step = _cycle_step(_value(item, cycle_key))
        amount = float(_value(item, "amount", 0) or 0)
        name = str(_value(item, "name") or _value(item, "merchant_name") or "Recurring payment")
        transaction_type = str(
            getattr(_value(item, "transaction_type", "debit"), "value", _value(item, "transaction_type", "debit"))
        ).lower()
        is_outflow = transaction_type not in {"credit", "income"}

        while current <= horizon_end:
            events.append({
                "date": current,
                "name": name,
                "amount": amount,
                "source": source,
                "is_outflow": is_outflow,
            })
            current = _next_occurrence(current, unit, step)
    return events


def build_cash_flow_forecast(
    *,
    starting_balance: float,
    subscriptions: list[dict],
    recurring_rules: list[dict],
    avg_daily_spend: float,
    avg_daily_income: float,
    days: int,
    today: date,
) -> dict:
    """Build a daily liquid-balance projection from recurring cash flows."""
    horizon_end = today + timedelta(days=days)
    events = _event_occurrences(
        subscriptions,
        date_key="next_billing_date",
        cycle_key="billing_cycle",
        horizon_end=horizon_end,
        source="subscription",
    )
    events.extend(
        _event_occurrences(
            recurring_rules,
            date_key="next_occurrence",
            cycle_key="frequency",
            horizon_end=horizon_end,
            source="recurring",
        )
    )
    events.sort(key=lambda event: (event["date"], event["name"]))

    daily_projection = []
    alerts = []
    below_buffer_alerted = False
    negative_alerted = False
    buffer = max(100.0, 0.1 * float(starting_balance))
    net_daily_change = float(avg_daily_income) - float(avg_daily_spend)

    for day_offset in range(days + 1):
        projection_date = today + timedelta(days=day_offset)
        day_events = [event for event in events if event["date"] == projection_date]
        scheduled_outflow = sum(event["amount"] for event in day_events if event["is_outflow"])
        scheduled_net = sum(
            event["amount"] if event["is_outflow"] else -event["amount"]
            for event in events
            if event["date"] <= projection_date
        )
        balance = float(starting_balance) + day_offset * net_daily_change - scheduled_net
        balance = round(balance, 2)

        if balance < buffer and not below_buffer_alerted:
            alerts.append({"date": projection_date.isoformat(), "type": "below_buffer", "balance": balance})
            below_buffer_alerted = True
        if balance < 0 and not negative_alerted:
            alerts.append({"date": projection_date.isoformat(), "type": "negative_balance", "balance": balance})
            negative_alerted = True

        daily_projection.append({
            "date": projection_date.isoformat(),
            "balance": balance,
            "scheduled_outflow": round(scheduled_outflow, 2),
        })

    lowest = min(daily_projection, key=lambda entry: (entry["balance"], entry["date"]))
    upcoming_events = [
        {
            "date": event["date"].isoformat(),
            "name": event["name"],
            "amount": round(event["amount"], 2),
            "source": event["source"],
        }
        for event in events
    ]
    total_scheduled_outflow = sum(
        event["amount"] for event in events if event["is_outflow"]
    )

    return {
        "days": days,
        "start_date": today.isoformat(),
        "end_date": horizon_end.isoformat(),
        "starting_balance": round(float(starting_balance), 2),
        "projected_end_balance": daily_projection[-1]["balance"],
        "lowest_balance": lowest["balance"],
        "lowest_balance_date": lowest["date"],
        "safe_to_spend": round(max(0.0, lowest["balance"] - buffer), 2),
        "buffer": round(buffer, 2),
        "avg_daily_spend": round(float(avg_daily_spend), 2),
        "avg_daily_income": round(float(avg_daily_income), 2),
        "total_scheduled_outflow": round(total_scheduled_outflow, 2),
        "upcoming_events": upcoming_events,
        "daily_projection": daily_projection,
        "alerts": alerts,
    }
