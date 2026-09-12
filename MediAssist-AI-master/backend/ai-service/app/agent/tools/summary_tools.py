from langchain_core.tools import tool


@tool
async def summarize_medical_text(text: str) -> str:
    """Résume un texte médical long."""
    text = text.strip()
    return text[:300]

