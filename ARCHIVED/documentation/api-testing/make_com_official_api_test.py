#!/usr/bin/env python3
"""
Make.com Official API Testing
Based on official API documentation at developers.make.com
"""

import asyncio
import aiohttp
import json
from datetime import datetime

async def test_make_official_api():
    """Test Make.com using official API documentation structure"""
    
    # This might be a webhook token, not an API token
    # According to docs, we need an API token created specifically for the API
    api_token = "38de02da-7c65-4d48-a7b4-01cf06b87fde"
    
    print("🔗 MAKE.COM OFFICIAL API TESTING")
    print("=" * 60)
    print(f"📅 Testing at: {datetime.now().isoformat()}")
    print("📚 Based on: https://developers.make.com/api-documentation/")
    
    # Official API base URL and structure
    base_url = "https://eu2.make.com/api/v2"
    
    headers = {
        "Authorization": f"Token {api_token}",
        "Content-Type": "application/json"
    }
    
    # Official API endpoints from documentation
    official_endpoints = [
        # User endpoints
        "/users/me",
        "/users/api-tokens",
        
        # Organization endpoints  
        "/organizations",
        "/organizations/current",
        
        # Team endpoints
        "/teams",
        
        # Scenario endpoints
        "/scenarios",
        "/scenarios/folders",
        
        # Template endpoints
        "/templates",
        "/templates/public",
        
        # Connection endpoints
        "/connections",
        
        # Webhook endpoints (Hooks)
        "/hooks",
        
        # Data stores
        "/data-stores",
        
        # General info
        "/general",
        "/enums"
    ]
    
    results = {
        "test_timestamp": datetime.now().isoformat(),
        "api_documentation": "https://developers.make.com/api-documentation/",
        "token_type": "Potentially webhook token (may need API token)",
        "base_url": base_url,
        "successful_calls": [],
        "failed_calls": [],
        "errors": []
    }
    
    async with aiohttp.ClientSession() as session:
        print(f"\n🔧 Testing Official API Endpoints")
        print(f"   Base URL: {base_url}")
        print(f"   Token: {api_token[:8]}...{api_token[-8:]}")
        
        for idx, endpoint in enumerate(official_endpoints):
            full_url = f"{base_url}{endpoint}"
            
            try:
                print(f"\n📡 [{idx + 1}/{len(official_endpoints)}] Testing: {endpoint}")
                
                # Rate limiting
                if idx > 0:
                    await asyncio.sleep(0.5)
                
                async with session.get(full_url, headers=headers, timeout=10) as response:
                    status = response.status
                    
                    if status == 200:
                        try:
                            data = await response.json()
                            record_count = len(data) if isinstance(data, list) else 1
                            
                            print(f"   ✅ SUCCESS: {status} - {record_count} items")
                            
                            results["successful_calls"].append({
                                "endpoint": endpoint,
                                "url": full_url,
                                "status": status,
                                "record_count": record_count,
                                "data_type": type(data).__name__
                            })
                            
                            # Show sample data structure
                            if isinstance(data, dict) and data:
                                sample_keys = list(data.keys())[:5]
                                print(f"      🔑 Sample keys: {sample_keys}")
                            elif isinstance(data, list) and data:
                                print(f"      📋 List with {len(data)} items")
                                if data and isinstance(data[0], dict):
                                    sample_keys = list(data[0].keys())[:5]
                                    print(f"      🔑 Item keys: {sample_keys}")
                        
                        except json.JSONDecodeError:
                            text_response = await response.text()
                            print(f"   ⚠️  Non-JSON response: {status} - {len(text_response)} chars")
                            
                            results["successful_calls"].append({
                                "endpoint": endpoint,
                                "url": full_url,
                                "status": status,
                                "response_type": "text",
                                "response_length": len(text_response)
                            })
                    
                    elif status == 401:
                        error_text = await response.text()
                        print(f"   🚫 UNAUTHORIZED: {status}")
                        
                        try:
                            error_json = json.loads(error_text)
                            error_detail = error_json.get('detail', 'Unknown error')
                            error_message = error_json.get('message', 'No message')
                            error_code = error_json.get('code', 'No code')
                            
                            print(f"      Detail: {error_detail}")
                            print(f"      Message: {error_message}")
                            print(f"      Code: {error_code}")
                            
                            results["failed_calls"].append({
                                "endpoint": endpoint,
                                "url": full_url,
                                "status": status,
                                "error_detail": error_detail,
                                "error_message": error_message,
                                "error_code": error_code
                            })
                            
                        except json.JSONDecodeError:
                            print(f"      Raw error: {error_text[:100]}...")
                            results["failed_calls"].append({
                                "endpoint": endpoint,
                                "url": full_url,
                                "status": status,
                                "error": error_text[:200]
                            })
                    
                    else:
                        error_text = await response.text()
                        print(f"   ❌ ERROR: {status} - {error_text[:100]}...")
                        
                        results["failed_calls"].append({
                            "endpoint": endpoint,
                            "url": full_url,
                            "status": status,
                            "error": error_text[:200]
                        })
            
            except asyncio.TimeoutError:
                print(f"   ⏰ TIMEOUT: Request timed out")
                results["failed_calls"].append({
                    "endpoint": endpoint,
                    "url": full_url,
                    "error": "Request timeout"
                })
            
            except Exception as e:
                print(f"   💥 EXCEPTION: {str(e)}")
                results["errors"].append({
                    "endpoint": endpoint,
                    "url": full_url,
                    "error": str(e)
                })
    
    # Save results
    output_file = "make_com_official_api_results.json"
    with open(output_file, 'w', encoding='utf-8') as f:
        json.dump(results, f, indent=2, ensure_ascii=False)
    
    # Generate summary
    print(f"\n🎉 MAKE.COM OFFICIAL API TESTING COMPLETE!")
    print("=" * 60)
    print(f"📊 SUMMARY:")
    print(f"   ✅ Successful calls: {len(results['successful_calls'])}")
    print(f"   🚫 Unauthorized calls: {len([c for c in results['failed_calls'] if c.get('status') == 401])}")
    print(f"   ❌ Other failures: {len([c for c in results['failed_calls'] if c.get('status') != 401])}")
    print(f"   💥 Errors: {len(results['errors'])}")
    
    # Analyze 401 errors for token type insights
    unauthorized_calls = [c for c in results['failed_calls'] if c.get('status') == 401]
    if unauthorized_calls:
        print(f"\n🔍 AUTHENTICATION ANALYSIS:")
        
        error_types = {}
        for call in unauthorized_calls:
            error_code = call.get('error_code', 'Unknown')
            error_detail = call.get('error_detail', 'Unknown')
            
            if error_code not in error_types:
                error_types[error_code] = []
            error_types[error_code].append(error_detail)
        
        for error_code, details in error_types.items():
            unique_details = list(set(details))
            print(f"   🚫 {error_code}: {unique_details[0]}")
        
        print(f"\n💡 DIAGNOSIS:")
        if any("Not authorized" in str(call.get('error_detail', '')) for call in unauthorized_calls):
            print(f"   🔑 Token appears to be webhook token, not API token")
            print(f"   📚 Need to create API token at: Make Settings > API > Create token")
            print(f"   ⚠️  Current token: {api_token[:8]}...{api_token[-8:]}")
        
        if any("Invalid bearer token" in str(call.get('error_detail', '')) for call in unauthorized_calls):
            print(f"   🔧 Bearer token format not accepted, use 'Token' format")
    
    print(f"\n💾 Complete results saved to: {output_file}")
    
    if results['successful_calls']:
        print(f"\n🎯 If any endpoints succeeded, explore them further...")
    else:
        print(f"\n📋 NEXT STEPS:")
        print(f"   1. Check if current token is webhook token vs API token")
        print(f"   2. Create proper API token in Make settings")
        print(f"   3. Verify organization/team access permissions")
        print(f"   4. Check Make.com region (EU2 vs US1)")
    
    return results

if __name__ == "__main__":
    asyncio.run(test_make_official_api()) 