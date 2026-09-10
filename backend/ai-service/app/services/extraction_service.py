import re


def extract(text: str) -> dict:
    """Extracts reviewable facts from clinical notes without inferring a diagnosis."""
    medications = re.findall(r"\b(?:paracétamol|ibuprofène|amoxicilline|metformine|insuline|aspirine)\b", text, flags=re.IGNORECASE)
    dates = re.findall(r"\b\d{1,2}[/-]\d{1,2}[/-]\d{2,4}\b", text)
    allergies = re.findall(r"allerg(?:ie|ique)\s+(?:à|a)\s+([^,.\n]+)", text, flags=re.IGNORECASE)
    return {
        "medications": sorted(set(medications)),
        "dates": sorted(set(dates)),
        "allergies": sorted(set(allergies)),
        "review_required": True,
    }

