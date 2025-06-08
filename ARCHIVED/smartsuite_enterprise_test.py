#!/usr/bin/env python3
"""
Smartsuite Enterprise Authentication Testing
"""

import asyncio
import aiohttp
import json

async def test_smartsuite_access():
    """Test different Smartsuite API authentication methods"""
    
    # Your credentials
    api_key = "d99cf9b32aeaa64bdebb86e05da1d50e951246d6"
    workspace_id = "suhw2iz6"
    
    print("🔍 SMARTSUITE ENTERPRISE API TESTING")
    print("=" * 50)
    
    # Different authentication headers to try
    auth_methods = [
        {
            "name": "Standard Token Auth",
            "headers": {
                "Authorization": f"Token {api_key}",
                "Account-Id": workspace_id,
                "Content-Type": "application/json"
            }
        },
        {
            "name": "Bearer Token Auth", 
            "headers": {
                "Authorization": f"Bearer {api_key}",
                "Account-Id": workspace_id,
                "Content-Type": "application/json"
            }
        },
        {
            "name": "API Key Header",
            "headers": {
                "X-API-Key": api_key,
                "Account-Id": workspace_id,
                "Content-Type": "application/json"
            }
        },
        {
            "name": "Workspace in Header",
            "headers": {
                "Authorization": f"Token {api_key}",
                "X-Workspace-Id": workspace_id,
                "Content-Type": "application/json"
            }
        }
    ]
    
    # Different API endpoints to try
    endpoints = [
        "https://app.smartsuite.com/api/v1/applications",
        "https://api.smartsuite.com/v1/applications", 
        "https://app.smartsuite.com/api/applications",
        "https://smartsuite.com/api/v1/applications",
        f"https://app.smartsuite.com/api/v1/workspaces/{workspace_id}/applications"
    ]
    
    async with aiohttp.ClientSession() as session:
        for auth_method in auth_methods:
            print(f"\n🔑 Testing: {auth_method['name']}")
            
            for endpoint in endpoints:
                try:
                    async with session.get(endpoint, headers=auth_method['headers']) as response:
                        print(f"  📡 {endpoint}")
                        print(f"     Status: {response.status}")
                        
                        if response.status == 200:
                            data = await response.json()
                            print(f"     ✅ SUCCESS! Found {len(data)} applications")
                            print(f"     Sample: {list(data.keys()) if isinstance(data, dict) else 'List data'}")
                            return data
                        elif response.status == 401:
                            print(f"     ❌ Unauthorized - Wrong credentials")
                        elif response.status == 403:
                            print(f"     ❌ Forbidden - Need enterprise access")
                        elif response.status == 404:
                            print(f"     ❌ Not Found - Wrong endpoint")
                        else:
                            error_text = await response.text()
                            print(f"     ⚠️  Status {response.status}: {error_text[:100]}")
                            
                except Exception as e:
                    print(f"     💥 Error: {str(e)}")
    
    print(f"\n🔍 Testing workspace-specific endpoints...")
    
    # Try workspace-specific endpoints
    workspace_endpoints = [
        f"https://app.smartsuite.com/api/v1/workspaces/{workspace_id}",
        f"https://app.smartsuite.com/api/v1/workspace/{workspace_id}/apps",
        f"https://app.smartsuite.com/api/v1/{workspace_id}/applications"
    ]
    
    async with aiohttp.ClientSession() as session:
        for endpoint in workspace_endpoints:
            for auth_method in auth_methods[:2]:  # Test top 2 methods
                try:
                    async with session.get(endpoint, headers=auth_method['headers']) as response:
                        print(f"  📡 {endpoint} ({auth_method['name']})")
                        print(f"     Status: {response.status}")
                        
                        if response.status == 200:
                            data = await response.json()
                            print(f"     ✅ SUCCESS! Data found")
                            return data
                        
                except Exception as e:
                    print(f"     💥 Error: {str(e)}")
    
    print(f"\n❌ No successful authentication method found")
    print(f"💡 Next steps:")
    print(f"   1. Check if you have enterprise/premium Smartsuite account")
    print(f"   2. Verify API key has correct permissions")
    print(f"   3. Contact Smartsuite support for API documentation")
    print(f"   4. Consider manual data export from Smartsuite UI")

if __name__ == "__main__":
    asyncio.run(test_smartsuite_access()) 