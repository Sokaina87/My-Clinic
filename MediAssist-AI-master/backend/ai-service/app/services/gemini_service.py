"""Gateway to the remote Gemini API. No medical answer is generated locally."""

import asyncio
import json

from google import genai
from google.genai import types

from app.config import settings

MEDICAL_SYSTEM_INSTRUCTION = """
Tu es MediAssist, un assistant clinique d'aide à l'organisation destiné à des professionnels.
Tu ne poses pas de diagnostic et ne prescris pas. Réponds en français, de façon concise,
en séparant faits, incertitudes et prochaines étapes. Pour une situation potentiellement
urgente, demande de suivre immédiatement le protocole d'urgence local. N'invente jamais
de dossier patient, de mesure ou de source.
""".strip()


async def generate_clinical_answer(message: str, context: str = "", json_mode: bool = False) -> str:
    """Generate an answer through Gemini's hosted API, using the configured free-tier key."""
    if not settings.google_api_key:
        raise RuntimeError("Clé Gemini absente : configurez GOOGLE_API_KEY dans le fichier .env.")

    prompt = f"{MEDICAL_SYSTEM_INSTRUCTION}\n\nContexte autorisé :\n{context or 'Aucun'}\n\nDemande :\n{message}"

    def request(model: str) -> str:
        client = genai.Client(api_key=settings.google_api_key)
        # Augmented token limit for detailed medical responses, lower temperature for clinical accuracy
        config_params = {
            "max_output_tokens": 4_000,  # Increased from 1000 for detailed medical analysis
            "temperature": 0.3,  # Slightly increased for more natural explanations
            "top_p": 0.95,  # Added for better response diversity
        }
        if json_mode:
            config_params["response_mime_type"] = "application/json"
        generation_config = types.GenerateContentConfig(**config_params)
        response = client.models.generate_content(
            model=model,
            contents=prompt,
            config=generation_config,
        )
        if not response.text:
            raise RuntimeError("L'API Gemini n'a renvoyé aucun texte.")
        return response.text.strip()

    models = tuple(dict.fromkeys((settings.gemini_model, settings.gemini_fallback_model)))
    for index, model in enumerate(models):
        try:
            return await asyncio.to_thread(request, model)
        except Exception as error:
            status_code = getattr(error, "code", None)
            if status_code not in {404, 429} or index == len(models) - 1:
                raise

    raise RuntimeError("Aucun modèle Gemini n'est disponible.")


async def generate_clinical_json(message: str) -> dict:
    """Request a JSON-only response from the hosted model; never fall back to local rules."""
    raw_response = await generate_clinical_answer(message, json_mode=True)
    payload = raw_response.removeprefix("```json").removeprefix("```").removesuffix("```").strip()
    try:
        return json.loads(payload)
    except json.JSONDecodeError as error:
        raise RuntimeError("Gemini a renvoyé une réponse non structurée.") from error
