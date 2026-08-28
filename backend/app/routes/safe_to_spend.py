import calendar
from datetime import date, datetime, timedelta
from typing import Any

from fastapi import APIRouter, Depends

from ..models import (
    Account,
    AccountType,
    RecurringRule,
    SafeToSpendResponse,
    Subscription,
    SubscriptionStatus,
    TransactionType,
)
from .recurring import calculate_next_occurrence
from ..storage.memory_adapter import db
from ..utils.auth import get_current_user

router = APIRouter()


def _as_date(value: date | datetime | str | None) -> date | None:
    if value is None:
        return None
    if isinstance(value, datetime):
        return value.date()
    if isinstance(value, date):
        return value
    return date.fromisoformat(value)


def _next_scheduled_date(current_date: date, rule: RecurringRule) -> date | None:
    frequency = str(rule.frequency).lower()
    if frequency == "daily":
        return current_date + timedelta(days=1)
    if frequency == "weekly":
        return current_date + timedelta(weeks=1)
    if frequency == "monthly":
        next_month = current_date.replace(day=1) + timedelta(days=32)
        next_month = next_month.replace(day=1)
        day = rule.day_of_month or current_date.day
        return next_month.replace(
            day=min(day, calendar.monthrange(next_month.year, next_month.month)[1])
        )
    if frequency in {"yearly", "annual"}:
        try:
            return current_date.replace(year=current_date.year + 1)
        except ValueError:
            return current_date.replace(year=current_date.year + 1, day=28)
    return None


def _first_occurrence_on_or_after(rule: RecurringRule, start_date: date) -> date | None:
    occurrence = _as_date(rule.next_occurrence)
    if occurrence is None:
        occurrence = calculate_next_occurrence(rule)

    rule_start = _as_date(rule.start_date)
    if rule_start and occurrence < rule_start:
        occurrence = rule_start

    while occurrence < start_date:
        next_occurrence = _next_scheduled_date(occurrence, rule)
        if next_occurrence is None:
            return None
        occurrence = next_occurrence

    rule_end = _as_date(rule.end_date)
    if rule_end and occurrence > rule_end:
        return None
    return occurrence


def _project_recurring_bills(
    rules: list[RecurringRule], start_date: date, end_date: date
) -> list[dict[str, Any]]:
    bills = []
    for rule in rules:
        occurrence = _first_occurrence_on_or_after(rule, start_date)
        while occurrence and occurrence <= end_date:
            bills.append(
                {
                    "name": rule.name,
                    "amount": rule.amount,
                    "due_date": occurrence,
                    "source": "recurring",
                }
            )
            occurrence = _next_scheduled_date(occurrence, rule)
            rule_end = _as_date(rule.end_date)
            if rule_end and occurrence and occurrence > rule_end:
                break
    return bills


def _transaction_type_value(value: Any) -> str:
    return str(getattr(value, "value", value)).lower()


@router.get("", response_model=SafeToSpendResponse)
async def get_safe_to_spend(
    current_user: dict = Depends(get_current_user),
    db_session: Any = Depends(db.get_db_dependency),
):
    """Calculate the amount the user can safely spend each day."""
    today = date.today()
    window_end = today + timedelta(days=30)
    user_id = current_user["user_id"]

    primary_accounts = db_session.query(Account).filter(
        Account.user_id == user_id,
        Account.is_active,
    ).all()
    joint_accounts = db_session.query(Account).filter(
        Account.joint_owner_id == user_id,
        Account.is_active,
    ).all()
    accounts = list({account.id: account for account in primary_accounts + joint_accounts}.values())
    liquid_types = {AccountType.CHECKING, AccountType.SAVINGS}
    liquid_balance = sum(
        float(account.balance or 0)
        for account in accounts
        if str(account.account_type).lower() in liquid_types
    )

    recurring_rules = db_session.query(RecurringRule).filter(
        RecurringRule.user_id == user_id,
        RecurringRule.is_active,
    ).all()
    expense_rules = [
        rule
        for rule in recurring_rules
        if _transaction_type_value(rule.transaction_type)
        == _transaction_type_value(TransactionType.DEBIT)
    ]
    bills = _project_recurring_bills(expense_rules, today, window_end)

    subscriptions = db_session.query(Subscription).filter(
        Subscription.user_id == user_id,
        Subscription.status == SubscriptionStatus.ACTIVE,
    ).all()
    for subscription in subscriptions:
        due_date = _as_date(subscription.next_billing_date)
        if due_date and today <= due_date <= window_end:
            bills.append(
                {
                    "name": subscription.merchant_name or subscription.name,
                    "amount": subscription.amount,
                    "due_date": due_date,
                    "source": "subscription",
                }
            )

    bills.sort(key=lambda bill: bill["due_date"])
    total_upcoming = sum(float(bill["amount"] or 0) for bill in bills)

    income_rules = [
        rule
        for rule in recurring_rules
        if _transaction_type_value(rule.transaction_type)
        == _transaction_type_value(TransactionType.CREDIT)
    ]
    income_dates = [
        occurrence
        for rule in income_rules
        if (occurrence := _first_occurrence_on_or_after(rule, today)) is not None
    ]
    next_income = min(income_dates) if income_dates else None
    days_until_next_income = (next_income - today).days if next_income else 30
    safe_to_spend = max(liquid_balance - total_upcoming, 0)
    safe_per_day = safe_to_spend / max(days_until_next_income, 1)

    return SafeToSpendResponse(
        liquid_balance=liquid_balance,
        upcoming_bills=bills,
        total_upcoming=total_upcoming,
        days_until_next_income=days_until_next_income,
        safe_to_spend=safe_to_spend,
        safe_per_day=safe_per_day,
    )
