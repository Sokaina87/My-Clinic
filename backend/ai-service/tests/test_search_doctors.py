import sys
import os
sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

import asyncio
import py_eureka_client.eureka_client as eureka_client

from app.config import settings
from app.agent.tools.doctor_tools import search_doctors


async def main():
    try:
        await eureka_client.init_async(
            eureka_server=settings.eureka_server,
            app_name="ai-service-test",
            instance_port=9999,
        )
        print("Eureka init OK")
    except Exception as e:
        print(f"Erreur init Eureka : {e}")
        return

    await asyncio.sleep(3)

    result = await search_doctors.ainvoke({"specialty": "généraliste"})
    print(result)

    await eureka_client.stop_async()


if __name__ == "__main__":
    asyncio.run(main())