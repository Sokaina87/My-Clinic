import sys
import os
sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

import asyncio
import py_eureka_client.eureka_client as eureka_client

from app.config import settings
from app.agent.agent import build_agent


def extract_text(content) -> str:
    """Extrait le texte propre d'un content, qu'il soit une string ou une liste de blocs."""
    if isinstance(content, str):
        return content
    if isinstance(content, list):
        texts = [block.get("text", "") for block in content if isinstance(block, dict) and block.get("type") == "text"]
        return "\n".join(texts)
    return str(content)


async def main():
    await eureka_client.init_async(
        eureka_server=settings.eureka_server,
        app_name="ai-service-test",
        instance_port=9999,
    )
    await asyncio.sleep(3)

    agent = build_agent()

    response = await agent.ainvoke({
        "messages": [{"role": "user", "content": "Quels sont les créneaux disponibles du Dr Ayoub Khaif ?"}]
    })

    # N'affiche que la réponse finale de l'agent, en texte simple
    last_message = response["messages"][-1]
    print(extract_text(last_message.content))

    await eureka_client.stop_async()


if __name__ == "__main__":
    asyncio.run(main())