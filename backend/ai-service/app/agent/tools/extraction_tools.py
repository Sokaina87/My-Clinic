from langchain_core.tools import tool


@tool
async def extract_medical_entities(text: str) -> dict:
    """Extrait des éléments médicaux simples d'un texte."""
    return {"raw_text": text, "entities": []}

