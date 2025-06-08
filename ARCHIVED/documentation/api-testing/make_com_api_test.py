#!/usr/bin/env python3
"""
Make.com API Testing - Multiple Approaches
Testing different endpoints and authentication methods for Make.com integration
"""

import asyncio
import aiohttp
import json
from datetime import datetime
import os

async def test_make_com_api():
    """Test Make.com API with multiple approaches"""
    
    # API credentials (from environment or direct)
    api_token = "38de02da-7c65-4d48-a7b4-01cf06b87fde"
    
    print("🔗 MAKE.COM API COMPREHENSIVE TESTING")
    print("=" * 60)
    print(f"📅 Testing at: {datetime.now().isoformat()}")
    
    # Different possible base URLs and authentication methods
    test_configurations = [
        {
            "name": "Official API v2",
            "base_url": "https://eu2.make.com/api/v2",
            "headers": {
                "Authorization": f"Token {api_token}",
                "Content-Type": "application/json"
            }
        },
        {
            "name": "Official API v1", 
            "base_url": "https://eu2.make.com/api/v1",
            "headers": {
                "Authorization": f"Token {api_token}",
                "Content-Type": "application/json"
            }
        },
        {
            "name": "Bearer Token Auth",
            "base_url": "https://eu2.make.com/api/v2", 
            "headers": {
                "Authorization": f"Bearer {api_token}",
                "Content-Type": "application/json"
            }
        },
        {
            "name": "API Key Header",
            "base_url": "https://eu2.make.com/api/v2",
            "headers": {
                "X-API-Key": api_token,
                "Content-Type": "application/json"
            }
        },
        {
            "name": "US Region",
            "base_url": "https://us1.make.com/api/v2",
            "headers": {
                "Authorization": f"Token {api_token}",
                "Content-Type": "application/json"
            }
        }
    ]
    
    # Different endpoints to test
    endpoints_to_test = [
        "/scenarios",
        "/teams", 
        "/organizations",
        "/users/me",
        "/scenarios/list",
        "/webhooks",
        "/connections",
        "/apps",
        "/templates",
        "/logs",
        "/organizations/current"
    ]
    
    results = {
        "test_timestamp": datetime.now().isoformat(),
        "configurations_tested": len(test_configurations),
        "endpoints_tested": len(endpoints_to_test),
        "successful_calls": [],
        "failed_calls": [],
        "errors": []
    }
    
    async with aiohttp.ClientSession() as session:
        
        for config_idx, config in enumerate(test_configurations):
            print(f"\n🔧 Testing Configuration {config_idx + 1}: {config['name']}")
            print(f"   Base URL: {config['base_url']}")
            
            for endpoint_idx, endpoint in enumerate(endpoints_to_test):
                full_url = f"{config['base_url']}{endpoint}"
                
                try:
                    print(f"   📡 [{endpoint_idx + 1}/{len(endpoints_to_test)}] Testing: {endpoint}")
                    
                    # Add small delay to avoid rate limiting
                    if endpoint_idx > 0:
                        await asyncio.sleep(0.5)
                    
                    async with session.get(full_url, headers=config['headers'], timeout=10) as response:
                        status = response.status
                        
                        if status == 200:
                            try:
                                data = await response.json()
                                record_count = len(data) if isinstance(data, list) else 1
                                
                                print(f"      ✅ SUCCESS: {status} - {record_count} items")
                                
                                results["successful_calls"].append({
                                    "configuration": config['name'],
                                    "endpoint": endpoint,
                                    "url": full_url,
                                    "status": status,
                                    "record_count": record_count,
                                    "data_type": type(data).__name__
                                })
                                
                                # Show sample data for successful calls
                                if isinstance(data, dict) and data:
                                    sample_keys = list(data.keys())[:5]
                                    print(f"         🔑 Sample keys: {sample_keys}")
                                elif isinstance(data, list) and data:
                                    if isinstance(data[0], dict):
                                        sample_keys = list(data[0].keys())[:5]
                                        print(f"         🔑 Sample keys: {sample_keys}")
                                
                            except json.JSONDecodeError:
                                text_response = await response.text()
                                print(f"      ⚠️  Non-JSON response: {status} - {len(text_response)} chars")
                                
                                results["successful_calls"].append({
                                    "configuration": config['name'],
                                    "endpoint": endpoint,
                                    "url": full_url,
                                    "status": status,
                                    "response_type": "text",
                                    "response_length": len(text_response)
                                })
                        
                        else:
                            error_text = await response.text()
                            print(f"      ❌ ERROR: {status} - {error_text[:100]}...")
                            
                            results["failed_calls"].append({
                                "configuration": config['name'],
                                "endpoint": endpoint,
                                "url": full_url,
                                "status": status,
                                "error": error_text[:200]
                            })
                
                except asyncio.TimeoutError:
                    print(f"      ⏰ TIMEOUT: Request timed out")
                    results["failed_calls"].append({
                        "configuration": config['name'],
                        "endpoint": endpoint,
                        "url": full_url,
                        "error": "Request timeout"
                    })
                
                except Exception as e:
                    print(f"      💥 EXCEPTION: {str(e)}")
                    results["errors"].append({
                        "configuration": config['name'],
                        "endpoint": endpoint,
                        "url": full_url,
                        "error": str(e)
                    })
    
    # Save comprehensive results
    output_file = "make_com_api_test_results.json"
    with open(output_file, 'w', encoding='utf-8') as f:
        json.dump(results, f, indent=2, ensure_ascii=False)
    
    # Generate summary report
    print(f"\n🎉 MAKE.COM API TESTING COMPLETE!")
    print("=" * 60)
    print(f"📊 SUMMARY RESULTS:")
    print(f"   ✅ Successful calls: {len(results['successful_calls'])}")
    print(f"   ❌ Failed calls: {len(results['failed_calls'])}")
    print(f"   💥 Errors: {len(results['errors'])}")
    
    if results['successful_calls']:
        print(f"\n🎯 SUCCESSFUL ENDPOINTS:")
        for success in results['successful_calls']:
            print(f"   ✅ {success['configuration']} → {success['endpoint']} ({success['status']})")
            if 'record_count' in success:
                print(f"      📊 {success['record_count']} records")
    
    if results['failed_calls']:
        print(f"\n⚠️  FAILED ENDPOINTS (Sample):")
        for failure in results['failed_calls'][:5]:  # Show first 5 failures
            print(f"   ❌ {failure['configuration']} → {failure['endpoint']} ({failure.get('status', 'No Status')})")
    
    print(f"\n💾 Complete results saved to: {output_file}")
    
    # If we found working endpoints, test them further
    if results['successful_calls']:
        print(f"\n🔍 EXPLORING SUCCESSFUL ENDPOINTS:")
        
        # Take the first successful configuration and endpoint
        success = results['successful_calls'][0]
        config = next(c for c in test_configurations if c['name'] == success['configuration'])
        
        print(f"   🎯 Using: {success['configuration']} → {success['endpoint']}")
        
        # Try to get detailed data from the working endpoint
        async with aiohttp.ClientSession() as session:
            try:
                async with session.get(success['url'], headers=config['headers']) as response:
                    if response.status == 200:
                        detailed_data = await response.json()
                        
                        # Save detailed successful response
                        detail_file = "make_com_successful_response.json"
                        with open(detail_file, 'w', encoding='utf-8') as f:
                            json.dump(detailed_data, f, indent=2, ensure_ascii=False)
                        
                        print(f"   💾 Detailed response saved to: {detail_file}")
                        
                        # Analyze the structure
                        if isinstance(detailed_data, dict):
                            print(f"   🔑 Response keys: {list(detailed_data.keys())}")
                        elif isinstance(detailed_data, list) and detailed_data:
                            print(f"   📋 List with {len(detailed_data)} items")
                            if isinstance(detailed_data[0], dict):
                                print(f"   🔑 Item keys: {list(detailed_data[0].keys())}")
                        
            except Exception as e:
                print(f"   💥 Error exploring successful endpoint: {e}")
    
    return results

if __name__ == "__main__":
    asyncio.run(test_make_com_api()) 