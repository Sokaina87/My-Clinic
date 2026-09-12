from pydantic import BaseModel


class ExtractionRequest(BaseModel):
    text: str


class ExtractionResponse(BaseModel):
    content: dict

