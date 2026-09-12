from pydantic import BaseModel


from typing import Optional

class AskRequest(BaseModel):
    message: str
    patient_name: Optional[str] = None
    patient_id: Optional[str] = None


class AskResponse(BaseModel):
    reply: str
