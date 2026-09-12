RED_FLAGS = {
    "douleur thoracique": "Douleur thoracique",
    "difficulté à respirer": "Difficulté à respirer",
    "difficulte a respirer": "Difficulté à respirer",
    "essoufflement": "Essoufflement important",
    "perte de connaissance": "Perte de connaissance",
    "paralysie": "Déficit neurologique ou paralysie",
    "saignement abondant": "Saignement abondant",
    "idées suicidaires": "Idées suicidaires",
}


def triage(symptoms: str) -> dict:
    """Rule-based safety net. It prioritises care; it never establishes a diagnosis."""
    normalized = symptoms.lower().strip()
    red_flags = [label for keyword, label in RED_FLAGS.items() if keyword in normalized]

    if red_flags:
        urgency = "critical" if any(flag in red_flags for flag in ["Perte de connaissance", "Saignement abondant", "Idées suicidaires"]) else "high"
        recommendation = "Contactez immédiatement les urgences locales ou un professionnel de santé."
    elif any(word in normalized for word in ["fièvre", "fievre", "vomissement", "douleur", "toux persistante", "infection"]):
        urgency = "medium"
        recommendation = "Une consultation médicale dans les 24 à 48 heures est recommandée."
    else:
        urgency = "low"
        recommendation = "Surveillez l'évolution et prenez rendez-vous si les symptômes persistent ou s'aggravent."

    return {
        "urgency": urgency,
        "summary": symptoms.strip()[:500],
        "red_flags": red_flags,
        "recommendation": recommendation,
        "disclaimer": "Cette évaluation aide à prioriser les soins et ne remplace pas un diagnostic médical.",
    }

