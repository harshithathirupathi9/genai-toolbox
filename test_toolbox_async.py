import asyncio
from toolbox_core import ToolboxClient

async def main():
    client = ToolboxClient(url="http://127.0.0.1:5000")

    # List available methods
    print(dir(client))

    # Example: if client has async ping method
    if hasattr(client, 'ping'):
        response = await client.ping()
        print("Ping response:", response)
    else:
        print("No ping method available on ToolboxClient")

asyncio.run(main())
