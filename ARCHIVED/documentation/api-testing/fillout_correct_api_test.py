#!/usr/bin/env python3
"""
Fillout API Testing - Correct Endpoints
Based on official documentation at https://www.fillout.com/help/fillout-rest-api
"""

import asyncio
import aiohttp
import json
from datetime import datetime

async def test_fillout_correct_api():
    """Test Fillout API with correct endpoints from official documentation"""
    
    # API credentials
    api_key = "fill_633a84f5e6a1be0028502ee2"
    
    print("📝 FILLOUT API - OFFICIAL ENDPOINTS TESTING")
    print("=" * 60)
    print(f"📅 Testing at: {datetime.now().isoformat()}")
    print("📚 Based on: https://www.fillout.com/help/fillout-rest-api")
    
    # Official base URL and endpoints from documentation
    base_url = "https://api.fillout.com"
    
    headers = {
        "Authorization": f"Bearer {api_key}",
        "Content-Type": "application/json"
    }
    
    # Official API endpoints from documentation
    official_endpoints = [
        # Core form endpoints
        "/v1/api/forms",
        
        # Webhook endpoints
        "/v1/api/webhook/create",
        "/v1/api/webhook/delete",
    ]
    
    results = {
        "test_timestamp": datetime.now().isoformat(),
        "api_documentation": "https://www.fillout.com/help/fillout-rest-api",
        "api_key": f"{api_key[:10]}...{api_key[-10:]}",
        "base_url": base_url,
        "successful_calls": [],
        "failed_calls": [],
        "errors": []
    }
    
    async with aiohttp.ClientSession() as session:
        print(f"\n🔧 Testing Official Fillout API Endpoints")
        print(f"   Base URL: {base_url}")
        print(f"   API Key: {api_key[:10]}...{api_key[-10:]}")
        
        for idx, endpoint in enumerate(official_endpoints):
            full_url = f"{base_url}{endpoint}"
            
            try:
                print(f"\n📡 [{idx + 1}/{len(official_endpoints)}] Testing: {endpoint}")
                
                # Rate limiting
                if idx > 0:
                    await asyncio.sleep(0.5)
                
                # Use GET for most endpoints, POST for webhook creation/deletion
                if endpoint in ["/v1/api/webhook/create", "/v1/api/webhook/delete"]:
                    # Skip POST endpoints for now (would need form data)
                    print(f"   ⏭️  SKIPPED: POST endpoint (requires form data)")
                    continue
                
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
                    
                    elif status == 404:
                        print(f"   ❌ NOT FOUND: {status}")
                        results["failed_calls"].append({
                            "endpoint": endpoint,
                            "url": full_url,
                            "status": status,
                            "error": "Endpoint not found"
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
    
    # If we have successful calls, explore them further
    if results['successful_calls']:
        print(f"\n🔍 EXPLORING SUCCESSFUL ENDPOINTS:")
        
        # Get forms endpoint succeeded, try to get form details
        forms_success = next((call for call in results['successful_calls'] 
                            if call['endpoint'] == '/v1/api/forms'), None)
        
        if forms_success:
            print(f"   🎯 Forms endpoint successful, exploring further...")
            
            try:
                async with aiohttp.ClientSession() as session:
                    async with session.get(forms_success['url'], headers=headers) as response:
                        if response.status == 200:
                            forms_data = await response.json()
                            
                            # Save forms data
                            forms_file = "fillout_forms_data.json"
                            with open(forms_file, 'w', encoding='utf-8') as f:
                                json.dump(forms_data, f, indent=2, ensure_ascii=False)
                            
                            print(f"   💾 Forms data saved to: {forms_file}")
                            
                            if isinstance(forms_data, list) and forms_data:
                                print(f"   📋 Found {len(forms_data)} forms")
                                
                                # Try to get detailed info for first form
                                first_form = forms_data[0]
                                if 'formId' in first_form:
                                    form_id = first_form['formId']
                                    form_name = first_form.get('name', 'Unknown')
                                    
                                    print(f"   🔍 Testing form details for: {form_name} (ID: {form_id})")
                                    
                                    # Test form metadata endpoint
                                    form_detail_url = f"{base_url}/v1/api/forms/{form_id}"
                                    async with session.get(form_detail_url, headers=headers) as detail_response:
                                        if detail_response.status == 200:
                                            form_detail = await detail_response.json()
                                            
                                            detail_file = f"fillout_form_{form_id}_detail.json"
                                            with open(detail_file, 'w', encoding='utf-8') as f:
                                                json.dump(form_detail, f, indent=2, ensure_ascii=False)
                                            
                                            print(f"      ✅ Form details saved to: {detail_file}")
                                            
                                            # Show form structure
                                            if 'questions' in form_detail:
                                                questions = form_detail['questions']
                                                print(f"      📋 Form has {len(questions)} questions")
                                                for i, q in enumerate(questions[:3]):  # Show first 3
                                                    print(f"         {i+1}. {q.get('name', 'Unnamed')} ({q.get('type', 'Unknown type')})")
                                            
                                            # Test submissions endpoint
                                            submissions_url = f"{base_url}/v1/api/forms/{form_id}/submissions"
                                            async with session.get(submissions_url, headers=headers) as sub_response:
                                                if sub_response.status == 200:
                                                    submissions_data = await sub_response.json()
                                                    
                                                    sub_file = f"fillout_form_{form_id}_submissions.json"
                                                    with open(sub_file, 'w', encoding='utf-8') as f:
                                                        json.dump(submissions_data, f, indent=2, ensure_ascii=False)
                                                    
                                                    print(f"      ✅ Submissions saved to: {sub_file}")
                                                    
                                                    if 'responses' in submissions_data:
                                                        responses = submissions_data['responses']
                                                        total = submissions_data.get('totalResponses', len(responses))
                                                        print(f"      📊 Form has {total} total submissions ({len(responses)} fetched)")
                                                
                                                else:
                                                    print(f"      ⚠️  Submissions failed: {sub_response.status}")
                                        
                                        else:
                                            print(f"      ⚠️  Form details failed: {detail_response.status}")
                                
                                # Show sample of all forms
                                print(f"\n   📋 FORMS OVERVIEW:")
                                for i, form in enumerate(forms_data[:5]):  # Show first 5
                                    form_name = form.get('name', 'Unnamed Form')
                                    form_id = form.get('formId', 'No ID')
                                    print(f"      {i+1}. {form_name} (ID: {form_id})")
                                
                                if len(forms_data) > 5:
                                    print(f"      ... and {len(forms_data) - 5} more forms")
                            
                            else:
                                print(f"   ⚠️  No forms found or unexpected data structure")
                        
                        else:
                            print(f"   ❌ Failed to re-fetch forms data: {response.status}")
            
            except Exception as e:
                print(f"   💥 Error exploring forms: {e}")
    
    # Save results
    output_file = "fillout_correct_api_results.json"
    with open(output_file, 'w', encoding='utf-8') as f:
        json.dump(results, f, indent=2, ensure_ascii=False)
    
    # Generate summary
    print(f"\n🎉 FILLOUT CORRECT API TESTING COMPLETE!")
    print("=" * 60)
    print(f"📊 SUMMARY:")
    print(f"   ✅ Successful calls: {len(results['successful_calls'])}")
    print(f"   🚫 Unauthorized (401): {len([c for c in results['failed_calls'] if c.get('status') == 401])}")
    print(f"   ❌ Not Found (404): {len([c for c in results['failed_calls'] if c.get('status') == 404])}")
    print(f"   ⚠️  Other failures: {len([c for c in results['failed_calls'] if c.get('status') not in [401, 404]])}")
    print(f"   💥 Errors: {len(results['errors'])}")
    
    # Authentication analysis
    unauthorized_calls = [c for c in results['failed_calls'] if c.get('status') == 401]
    if unauthorized_calls:
        print(f"\n🔍 AUTHENTICATION ANALYSIS:")
        for call in unauthorized_calls:
            error_detail = call.get('error_detail', 'Unknown')
            print(f"   🚫 {call['endpoint']}: {error_detail}")
        
        print(f"\n💡 DIAGNOSIS:")
        print(f"   🔑 API Key format: {api_key[:15]}...")
        print(f"   📚 Check API key in Fillout Settings > Developer > API")
        print(f"   ⚠️  Verify API access is enabled for your account")
    
    print(f"\n💾 Complete results saved to: {output_file}")
    
    if results['successful_calls']:
        print(f"\n🎯 SUCCESS! Fillout API is working")
        print(f"   📋 Access to forms and submissions confirmed")
    else:
        print(f"\n📋 NEXT STEPS:")
        print(f"   1. Verify API key in Fillout dashboard")
        print(f"   2. Check if API access is enabled")
        print(f"   3. Confirm account permissions")
    
    return results

if __name__ == "__main__":
    asyncio.run(test_fillout_correct_api()) 