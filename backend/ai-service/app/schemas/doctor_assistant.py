from pydantic import BaseModel, Field


class PatientAttentionItem(BaseModel):
    id: str
    name: str
    last_consultation: str | None = None
    follow_up_due: str | None = None
    symptoms: str = ""
    priority: str = "low"


class DoctorAssistantRequest(BaseModel):
    question: str = Field(min_length=3, max_length=1_500)
    patients: list[PatientAttentionItem] = []


class DoctorAssistantResponse(BaseModel):
    answer: str
    intent: str
    patients_requiring_attention: list[PatientAttentionItem] = []
