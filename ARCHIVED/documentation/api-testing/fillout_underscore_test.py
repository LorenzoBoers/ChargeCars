#!/usr/bin/env python3
"""
Fillout API Testing - Underscore Format Testing
Testing different underscore formats based on "API key missing underscore" error
"""

import asyncio
import aiohttp
import json
from datetime import datetime

async def test_fillout_underscore_formats():
    """Test Fillout API with different underscore formats"""
    
    # Original key and different underscore variants
    original_key = "fill_633a84f5e6a1be0028502ee2"
    
    # Different possible underscore formats
    test_keys = [
        # Original with underscore
        "fill_633a84f5e6a1be0028502ee2",
        
        # Without fill prefix but with underscore somewhere
        "633a84f5_e6a1be0028502ee2",
        "633a84f5e6a1be_0028502ee2", 
        "633a84f5e6a1be0028_502ee2",
        "633a84f5e6a1be0028502e_e2",
        
        # With different prefixes
        "api_633a84f5e6a1be0028502ee2",
        "key_633a84f5e6a1be0028502ee2",
        
        # Underscore at different positions in original
        "fill633a84f5e6a1be0028502ee2_",
        "_fill_633a84f5e6a1be0028502ee2",
        
        # Common API key patterns with underscores
        "633a84f5_e6a1be0028502ee2_fill",
        "fill_633a84f5_e6a1be0028502ee2",
    ]
    
    print("📝 FILLOUT API - UNDERSCORE FORMAT TESTING")
    print("=" * 60)
    print(f"📅 Testing at: {datetime.now().isoformat()}")
    print(f"🔧 Original key: {original_key}")
    print(f"🧪 Testing {len(test_keys)} different underscore formats")
    
    # Official base URL
    base_url = "https://api.fillout.com"
    endpoint = "/v1/api/forms"
    
    results = {
        "test_timestamp": datetime.now().isoformat(),
        "original_key": original_key,
        "endpoint_tested": endpoint,
        "test_results": [],
        "successful_format": None
    }
    
    async with aiohttp.ClientSession() as session:
        
        for idx, test_key in enumerate(test_keys):
            print(f"\n🔧 [{idx + 1}/{len(test_keys)}] Testing key format: {test_key}")
            
            headers = {
                "Authorization": f"Bearer {test_key}",
                "Content-Type": "application/json"
            }
            
            full_url = f"{base_url}{endpoint}"
            
            try:
                async with session.get(full_url, headers=headers, timeout=10) as response:
                    status = response.status
                    error_text = await response.text()
                    
                    test_result = {
                        "key_format": test_key,
                        "status": status,
                        "response": error_text[:200] if len(error_text) > 200 else error_text
                    }
                    
                    if status == 200:
                        print(f"   ✅ SUCCESS: {status}")
                        
                        try:
                            data = await response.json()
                            test_result["success"] = True
                            test_result["data_type"] = type(data).__name__
                            test_result["record_count"] = len(data) if isinstance(data, list) else 1
                            
                            results["successful_format"] = test_key
                            
                            print(f"      📊 Data type: {type(data).__name__}")
                            if isinstance(data, list):
                                print(f"      📋 Found {len(data)} items")
                            
                        except json.JSONDecodeError:
                            test_result["success"] = True
                            test_result["data_type"] = "text"
                            results["successful_format"] = test_key
                    
                    elif status == 400:
                        print(f"   ❌ BAD REQUEST: {status}")
                        try:
                            error_json = json.loads(error_text)
                            error_msg = error_json.get('message', 'Unknown error')
                            print(f"      Error: {error_msg}")
                        except:
                            print(f"      Error: {error_text[:100]}...")
                    
                    elif status == 401:
                        print(f"   🚫 UNAUTHORIZED: {status}")
                        print(f"      Error: {error_text[:100]}...")
                    
                    else:
                        print(f"   ⚠️  STATUS: {status}")
                        print(f"      Response: {error_text[:100]}...")
                    
                    results["test_results"].append(test_result)
                    
                    # Small delay between tests
                    await asyncio.sleep(0.3)
            
            except Exception as e:
                print(f"   💥 EXCEPTION: {str(e)}")
                results["test_results"].append({
                    "key_format": test_key,
                    "error": str(e)
                })
    
    # Save results
    output_file = "fillout_underscore_test_results.json"
    with open(output_file, 'w', encoding='utf-8') as f:
        json.dump(results, f, indent=2, ensure_ascii=False)
    
    # Generate summary
    print(f"\n🎉 FILLOUT UNDERSCORE TESTING COMPLETE!")
    print("=" * 60)
    
    # Analyze results
    successful_tests = [r for r in results["test_results"] if r.get("success", False)]
    bad_request_tests = [r for r in results["test_results"] if r.get("status") == 400]
    unauthorized_tests = [r for r in results["test_results"] if r.get("status") == 401]
    
    print(f"📊 SUMMARY:")
    print(f"   ✅ Successful: {len(successful_tests)}")
    print(f"   ❌ Bad Request (400): {len(bad_request_tests)}")
    print(f"   🚫 Unauthorized (401): {len(unauthorized_tests)}")
    print(f"   ⚠️  Other: {len(results['test_results']) - len(successful_tests) - len(bad_request_tests) - len(unauthorized_tests)}")
    
    if successful_tests:
        print(f"\n🎯 SUCCESS! Working API key format found:")
        for success in successful_tests:
            print(f"   ✅ {success['key_format']}")
        
        # If we found a working format, test it further
        working_key = successful_tests[0]['key_format']
        print(f"\n🔍 EXPLORING WITH WORKING KEY: {working_key}")
        
        headers = {
            "Authorization": f"Bearer {working_key}",
            "Content-Type": "application/json"
        }
        
        try:
            async with aiohttp.ClientSession() as session:
                async with session.get(full_url, headers=headers) as response:
                    if response.status == 200:
                        forms_data = await response.json()
                        
                        # Save successful data
                        success_file = f"fillout_successful_data_{working_key.replace('_', '-')[:20]}.json"
                        with open(success_file, 'w', encoding='utf-8') as f:
                            json.dump(forms_data, f, indent=2, ensure_ascii=False)
                        
                        print(f"   💾 Successful data saved to: {success_file}")
                        
                        if isinstance(forms_data, list) and forms_data:
                            print(f"   📋 Found {len(forms_data)} forms")
                            
                            for i, form in enumerate(forms_data[:3]):  # Show first 3
                                form_name = form.get('name', 'Unnamed')
                                form_id = form.get('formId', 'No ID')
                                print(f"      {i+1}. {form_name} (ID: {form_id})")
                            
                            if len(forms_data) > 3:
                                print(f"      ... and {len(forms_data) - 3} more forms")
        
        except Exception as e:
            print(f"   💥 Error exploring working key: {e}")
    
    else:
        print(f"\n📊 ERROR PATTERN ANALYSIS:")
        
        # Group errors by message
        error_messages = {}
        for test in results["test_results"]:
            if test.get("status") == 400:
                try:
                    response = test.get("response", "")
                    if response.startswith("{"):
                        error_json = json.loads(response)
                        msg = error_json.get("message", "Unknown")
                    else:
                        msg = response[:50]
                    
                    if msg not in error_messages:
                        error_messages[msg] = []
                    error_messages[msg].append(test["key_format"])
                except:
                    pass
        
        for msg, keys in error_messages.items():
            print(f"   ❌ '{msg}': {len(keys)} formats")
            for key in keys[:2]:  # Show first 2 examples
                print(f"      • {key}")
            if len(keys) > 2:
                print(f"      • ... and {len(keys) - 2} more")
    
    print(f"\n💾 Complete results saved to: {output_file}")
    
    return results

if __name__ == "__main__":
    asyncio.run(test_fillout_underscore_formats()) 