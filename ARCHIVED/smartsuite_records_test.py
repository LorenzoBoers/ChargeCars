#!/usr/bin/env python3
"""
Test different methods to access Smartsuite records
"""

import asyncio
import aiohttp
import json

async def test_smartsuite_records():
    """Test different approaches to get Smartsuite records"""
    
    api_key = "d99cf9b32aeaa64bdebb86e05da1d50e951246d6"
    workspace_id = "suhw2iz6"
    
    headers = {
        "Authorization": f"Token {api_key}",
        "Account-Id": workspace_id,
        "Content-Type": "application/json"
    }
    
    print("🔍 TESTING SMARTSUITE RECORDS ACCESS")
    print("=" * 50)
    
    # First get a sample application ID
    async with aiohttp.ClientSession() as session:
        async with session.get("https://app.smartsuite.com/api/v1/applications", headers=headers) as response:
            applications = await response.json()
            
        # Test with first few applications
        test_apps = applications[:3]
        
        for app in test_apps:
            app_id = app.get('id')
            app_name = app.get('name', 'Unknown')
            
            print(f"\n🧪 Testing: {app_name} (ID: {app_id})")
            
            # Different URL patterns to try
            url_patterns = [
                f"https://app.smartsuite.com/api/v1/applications/{app_id}/records",
                f"https://app.smartsuite.com/api/v1/applications/{app_id}/items",
                f"https://app.smartsuite.com/api/v1/applications/{app_id}/data",
                f"https://app.smartsuite.com/api/v1/apps/{app_id}/records",
                f"https://app.smartsuite.com/api/v1/{app_id}/records"
            ]
            
            # Different HTTP methods to try
            methods = ['GET', 'POST']
            
            for method in methods:
                for url in url_patterns:
                    try:
                        if method == 'GET':
                            async with session.get(url, headers=headers) as response:
                                status = response.status
                                if status == 200:
                                    data = await response.json()
                                    print(f"   ✅ {method} {url}: SUCCESS! {len(data.get('items', data)) if isinstance(data, dict) else len(data)} items")
                                    return data
                                else:
                                    print(f"   ❌ {method} {url}: {status}")
                        
                        elif method == 'POST':
                            # Try POST with empty body
                            async with session.post(url, headers=headers, json={}) as response:
                                status = response.status
                                if status == 200:
                                    data = await response.json()
                                    print(f"   ✅ {method} {url}: SUCCESS! {len(data.get('items', data)) if isinstance(data, dict) else len(data)} items")
                                    return data
                                else:
                                    print(f"   ❌ {method} {url}: {status}")
                                    
                    except Exception as e:
                        print(f"   💥 {method} {url}: {str(e)[:50]}")
        
        # Try alternative API documentation endpoints
        print(f"\n📚 Testing API documentation endpoints...")
        doc_endpoints = [
            "https://app.smartsuite.com/api/v1/docs",
            "https://app.smartsuite.com/api/docs",
            "https://app.smartsuite.com/api/v1/schema",
            f"https://app.smartsuite.com/api/v1/workspaces/{workspace_id}/schema"
        ]
        
        for endpoint in doc_endpoints:
            try:
                async with session.get(endpoint, headers=headers) as response:
                    if response.status == 200:
                        data = await response.json()
                        print(f"   ✅ Documentation found at: {endpoint}")
                        print(f"   📖 Keys: {list(data.keys()) if isinstance(data, dict) else 'List data'}")
                    else:
                        print(f"   ❌ {endpoint}: {response.status}")
            except Exception as e:
                print(f"   💥 {endpoint}: {str(e)[:50]}")
    
    print(f"\n💡 Recommendations:")
    print(f"   1. Check Smartsuite API documentation for correct records endpoint")
    print(f"   2. Verify API key has 'read records' permissions")
    print(f"   3. Try POST method with query parameters")
    print(f"   4. Contact Smartsuite support for API guidance")
    print(f"   5. Consider manual CSV export from Smartsuite UI")

if __name__ == "__main__":
    asyncio.run(test_smartsuite_records()) 