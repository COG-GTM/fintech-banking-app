from datetime import date
from typing import Literal

from pydantic import BaseModel, field_validator


class UpcomingBill(BaseModel):
    name: str
    amount: float
    due_date: date
    source: Literal["recurring", "subscription"]

    @field_validator("amount", mode="before")
    @classmethod
    def format_amount(cls, value: float) -> float:
        return round(float(value), 2)


class SafeToSpendResponse(BaseModel):
    liquid_balance: float
    upcoming_bills: list[UpcomingBill]
    total_upcoming: float
    days_until_next_income: int
    safe_to_spend: float
    safe_per_day: float

    @field_validator(
        "liquid_balance",
        "total_upcoming",
        "safe_to_spend",
        "safe_per_day",
        mode="before",
    )
    @classmethod
    def format_money_fields(cls, value: float) -> float:
        return round(float(value), 2)
