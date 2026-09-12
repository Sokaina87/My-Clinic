from langchain_core.tools import tool


@tool
async def triage_symptoms(symptoms: str) -> dict:
    """Analyse les symptômes et retourne un niveau d'urgence estimé  soit on english
    et francais ."""
    symptoms_l = symptoms.lower().strip()

    if any(word in symptoms_l for word in ["douleur thoracique", "respirer", "essouffle", "perte de connaissance"]):
        return {"urgency": "high", "advice": "Contact médical urgent recommandé."}
    if any(word in symptoms_l for word in ["fièvre", "toux", "fatigue", "maux de tête"]):
        return {"urgency": "medium", "advice": "Consultation recommandée."}
    return {"urgency": "low", "advice": "Surveillance et suivi conseillé."}

