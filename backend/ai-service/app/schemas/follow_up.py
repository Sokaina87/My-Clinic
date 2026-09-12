from pydantic import BaseModel, Field


class FollowUpRequest(BaseModel):
    patient_id: str
    consultation_summary: str = Field(min_length=3, max_length=4_000)
    symptoms: str = ""


class FollowUpResponse(BaseModel):
    questions: list[str]
    attention_level: str
    reasons: list[str]


class FollowUpAssessmentRequest(BaseModel):
    patient_id: str
    answers: dict[str, str]


class FollowUpAssessmentResponse(BaseModel):
    attention_level: str
    reasons: list[str]
    next_step: str
