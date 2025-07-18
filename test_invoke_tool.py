import asyncio
from toolbox_core import ToolboxClient

async def main():
    print("Connecting to MCP Toolbox server...")

    async with ToolboxClient("http://127.0.0.1:5000") as client:
        tools = await client.load_toolset("my_first_toolset")
        print("Tools loaded successfully!")

        # Get your tool
        tool = tools[0]

        # Invoke the tool with a test name
        print("Invoking tool with name='Sunset'...")
        result = await tool("Hello")

        print(" Result:", result)

asyncio.run(main())
