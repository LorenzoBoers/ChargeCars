#!/usr/bin/env python3
"""
ChargeCars MCP Runner with Direct Credentials
"""

import asyncio
from chargecars_mcp import ChargeCarsSystemMCP, SystemCredentials

async def main():
    # Direct credentials to bypass environment variable issues
    credentials = SystemCredentials(
        smartsuite_api_key="d99cf9b32aeaa64bdebb86e05da1d50e951246d6",
        smartsuite_workspace_id="suhw2iz6",
        make_com_token="c837f61e-75b9-4d76-9e72-58953fe8c348",
        clickup_token="pk_38199608_RWBKIFPYH9LSP1DAR6ZLNJD2ZQP5IY4T",
        clickup_team_id="20122951",
        fillout_api_key="sk_prod_Ot4xSgrEy4m7l6SaZLDt1RNahth2Gc9aZ7mgLh3X6Os20E5cpj2rJ9u9a6tc04l0d9OoxXe24PEFMSO4duOQOgKefGwDfoa6MCt_21956",
        noloco_access_token="eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOjEsImVtYWlsIjoibG9yZW56b0BjaGFyZ2VjYXJzLm5sIiwicHJvamVjdCI6ImNoYXJnZWNhcnMiLCJ0eXBlIjoiQVBJIiwiaWF0IjoxNzQ4MzMxMDc1fQ.-Ykj_XRQdQfx3x3PgqTakhWnzNtowSahcFhwUaNwhfk"
    )
    
    print("🚀 ChargeCars System Documentation MCP")
    print("=====================================")
    print("🔑 Using direct credentials...")
    
    # Run the MCP
    async with ChargeCarsSystemMCP(credentials) as mcp:
        print("📊 Starting complete system extraction...")
        
        # Extract data from all systems
        results = await mcp.extract_all_systems()
        
        print("💾 Saving results...")
        await mcp.save_results()
        
        print("✅ Complete! Check 'chargecars_system_analysis.json' for results.")
        print(f"📈 Extracted data from {len(results)} systems")

if __name__ == "__main__":
    asyncio.run(main()) 