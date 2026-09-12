from typing import Literal

from pydantic import BaseModel, Field


class TriageRequest(BaseModel):
    symptoms: str = Field(min_length=3, max_length=4_000)


class TriageResponse(BaseModel):
    urgency: Literal["low", "medium", "high", "critical"]
    summary: str
    red_flags: list[str]
    recommendation: str
    disclaimer: str

