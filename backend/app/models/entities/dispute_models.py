from datetime import datetime
from enum import StrEnum

from pydantic import BaseModel, ConfigDict, Field


class DisputeReason(StrEnum):
    UNRECOGNISED = "unrecognised"
    DUPLICATE = "duplicate"
    WRONG_AMOUNT = "wrong_amount"
    GOODS_NOT_RECEIVED = "goods_not_received"


class DisputeStatus(StrEnum):
    OPEN = "open"
    CANCELLED = "cancelled"


class DisputeCreate(BaseModel):
    reason: DisputeReason
    details: str | None = Field(None, max_length=1000)


class DisputeResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: int
    transaction_id: int
    user_id: int
    reason: DisputeReason
    details: str | None = None
    status: DisputeStatus
    created_at: datetime
    cancelled_at: datetime | None = None
