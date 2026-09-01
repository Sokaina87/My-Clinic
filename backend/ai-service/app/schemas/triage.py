from pydantic import BaseModel


class TriageRequest(BaseModel):
    symptoms: str


class TriageResponse(BaseModel):
    urgency: str
    summary: str

