#!/usr/bin/env python3
"""
Fillout API Testing - Fixed API Key Format
Removing the 'fill_' prefix from the API key based on error response
"""

import asyncio
import aiohttp
import json
from datetime import datetime

async def test_fillout_fixed_api():
    """Test Fillout API with corrected API key format"""
    
    # API credentials - removing 'fill_' prefix
    original_key = "fill_633a84f5e6a1be0028502ee2"
    api_key = "633a84f5e6a1be0028502ee2"  # Removed 'fill_' prefix
    
    print("📝 FILLOUT API - FIXED API KEY FORMAT")
    print("=" * 60)
    print(f"📅 Testing at: {datetime.now().isoformat()}")
    print(f"🔧 Original key: {original_key}")
    print(f"🔑 Fixed key: {api_key}")
    
    # Official base URL
    base_url = "https://api.fillout.com"
    
    headers = {
        "Authorization": f"Bearer {api_key}",
        "Content-Type": "application/json"
    }
    
    # Official API endpoints from documentation
    official_endpoints = [
        "/v1/api/forms",
    ]
    
    results = {
        "test_timestamp": datetime.now().isoformat(),
        "original_api_key": f"{original_key[:10]}...{original_key[-10:]}",
        "fixed_api_key": f"{api_key[:10]}...{api_key[-10:]}",
        "base_url": base_url,
        "successful_calls": [],
        "failed_calls": [],
        "errors": []
    }
    
    async with aiohttp.ClientSession() as session:
        print(f"\n🔧 Testing with Fixed API Key Format")
        print(f"   Base URL: {base_url}")
        print(f"   Fixed API Key: {api_key[:10]}...{api_key[-10:]}")
        
        for idx, endpoint in enumerate(official_endpoints):
            full_url = f"{base_url}{endpoint}"
            
            try:
                print(f"\n📡 [{idx + 1}/{len(official_endpoints)}] Testing: {endpoint}")
                
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
                        print(f"      Error: {error_text}")
                        
                        results["failed_calls"].append({
                            "endpoint": endpoint,
                            "url": full_url,
                            "status": status,
                            "error": error_text[:200]
                        })
                    
                    elif status == 400:
                        error_text = await response.text()
                        print(f"   ❌ BAD REQUEST: {status}")
                        print(f"      Error: {error_text}")
                        
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
            
            except Exception as e:
                print(f"   💥 EXCEPTION: {str(e)}")
                results["errors"].append({
                    "endpoint": endpoint,
                    "url": full_url,
                    "error": str(e)
                })
    
    # If successful, explore further
    if results['successful_calls']:
        print(f"\n🎉 SUCCESS! API KEY FIXED!")
        print(f"🔍 EXPLORING FILLOUT FORMS...")
        
        # Get forms data
        forms_success = results['successful_calls'][0]
        
        try:
            async with aiohttp.ClientSession() as session:
                async with session.get(forms_success['url'], headers=headers) as response:
                    if response.status == 200:
                        forms_data = await response.json()
                        
                        # Save forms data
                        forms_file = "fillout_forms_successful.json"
                        with open(forms_file, 'w', encoding='utf-8') as f:
                            json.dump(forms_data, f, indent=2, ensure_ascii=False)
                        
                        print(f"   💾 Forms data saved to: {forms_file}")
                        
                        if isinstance(forms_data, list) and forms_data:
                            print(f"   📋 Found {len(forms_data)} forms")
                            
                            # Show all forms
                            print(f"\n   📋 FORMS OVERVIEW:")
                            for i, form in enumerate(forms_data):
                                form_name = form.get('name', 'Unnamed Form')
                                form_id = form.get('formId', 'No ID')
                                print(f"      {i+1}. {form_name} (ID: {form_id})")
                            
                            # Test first form in detail
                            if forms_data:
                                first_form = forms_data[0]
                                form_id = first_form.get('formId')
                                form_name = first_form.get('name', 'Unknown')
                                
                                if form_id:
                                    print(f"\n   🔍 EXPLORING FIRST FORM: {form_name}")
                                    
                                    # Get form details
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
                                                print(f"      📋 Form has {len(questions)} questions:")
                                                for i, q in enumerate(questions):
                                                    q_name = q.get('name', 'Unnamed Question')
                                                    q_type = q.get('type', 'Unknown Type')
                                                    q_id = q.get('id', 'No ID')
                                                    print(f"         {i+1}. {q_name} ({q_type}) [ID: {q_id}]")
                                            
                                            # Get submissions
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
                                                        
                                                        # Show sample submission
                                                        if responses:
                                                            print(f"      📝 Sample submission structure:")
                                                            sample_sub = responses[0]
                                                            if 'questions' in sample_sub:
                                                                for q in sample_sub['questions'][:3]:  # First 3 answers
                                                                    q_name = q.get('name', 'Unknown')
                                                                    q_value = q.get('value', 'No value')
                                                                    print(f"         • {q_name}: {q_value}")
                                                    
                                                    else:
                                                        print(f"      ℹ️  No submissions data structure found")
                                                
                                                else:
                                                    print(f"      ⚠️  Submissions failed: {sub_response.status}")
                                        
                                        else:
                                            print(f"      ⚠️  Form details failed: {detail_response.status}")
                        
                        else:
                            print(f"   ⚠️  No forms found or unexpected data structure")
        
        except Exception as e:
            print(f"   💥 Error exploring forms: {e}")
    
    # Save results
    output_file = "fillout_fixed_api_results.json"
    with open(output_file, 'w', encoding='utf-8') as f:
        json.dump(results, f, indent=2, ensure_ascii=False)
    
    # Generate summary
    print(f"\n🎉 FILLOUT FIXED API TESTING COMPLETE!")
    print("=" * 60)
    print(f"📊 SUMMARY:")
    print(f"   ✅ Successful calls: {len(results['successful_calls'])}")
    print(f"   ❌ Failed calls: {len(results['failed_calls'])}")
    print(f"   💥 Errors: {len(results['errors'])}")
    
    if results['successful_calls']:
        print(f"\n🎯 SUCCESS! Fillout API is working with fixed key format")
        print(f"   🔑 Correct format: Remove 'fill_' prefix from API key")
        print(f"   📋 Access to forms and submissions confirmed")
    else:
        print(f"\n📋 API KEY FORMAT ANALYSIS:")
        for call in results['failed_calls']:
            print(f"   ❌ Status {call['status']}: {call.get('error', 'Unknown error')}")
        
        print(f"\n💡 RECOMMENDATIONS:")
        print(f"   1. Check if API key needs different format")
        print(f"   2. Verify API key is active in Fillout dashboard")
        print(f"   3. Check account permissions")
    
    print(f"\n💾 Complete results saved to: {output_file}")
    
    return results

if __name__ == "__main__":
    asyncio.run(test_fillout_fixed_api()) 