#!/usr/bin/env python3
"""
Fillout EU API Testing
Testing with the EU API endpoint: https://eu-api.fillout.com/v1/api
Based on documentation showing both US and EU endpoints
"""

import asyncio
import aiohttp
import json
from datetime import datetime

async def test_fillout_eu_api():
    """Test Fillout API using EU endpoint"""
    
    # API credentials - test both formats
    original_key = "fill_633a84f5e6a1be0028502ee2"
    
    test_keys = [
        original_key,  # With fill_ prefix
        "633a84f5e6a1be0028502ee2",  # Without fill_ prefix
    ]
    
    print("📝 FILLOUT EU API TESTING")
    print("=" * 60)
    print(f"📅 Testing at: {datetime.now().isoformat()}")
    print("🇪🇺 Using EU API endpoint: https://eu-api.fillout.com")
    
    # EU API endpoint from documentation
    base_urls = [
        "https://eu-api.fillout.com",  # EU endpoint
        "https://api.fillout.com",     # US endpoint for comparison
    ]
    
    endpoint = "/v1/api/forms"
    
    results = {
        "test_timestamp": datetime.now().isoformat(),
        "eu_endpoint": "https://eu-api.fillout.com",
        "us_endpoint": "https://api.fillout.com",
        "test_results": [],
        "successful_combinations": []
    }
    
    async with aiohttp.ClientSession() as session:
        
        for base_url in base_urls:
            region = "EU" if "eu-api" in base_url else "US"
            print(f"\n🌍 Testing {region} Region: {base_url}")
            
            for key_idx, api_key in enumerate(test_keys):
                key_type = "Original (with fill_)" if "fill_" in api_key else "Modified (without fill_)"
                print(f"\n🔑 [{key_idx + 1}/{len(test_keys)}] Testing {key_type}: {api_key[:15]}...")
                
                headers = {
                    "Authorization": f"Bearer {api_key}",
                    "Content-Type": "application/json"
                }
                
                full_url = f"{base_url}{endpoint}"
                
                try:
                    async with session.get(full_url, headers=headers, timeout=10) as response:
                        status = response.status
                        response_text = await response.text()
                        
                        test_result = {
                            "region": region,
                            "base_url": base_url,
                            "api_key_format": key_type,
                            "api_key": f"{api_key[:10]}...{api_key[-10:]}",
                            "status": status,
                            "response": response_text[:200] if len(response_text) > 200 else response_text
                        }
                        
                        if status == 200:
                            print(f"   ✅ SUCCESS: {status}")
                            
                            try:
                                data = await response.json()
                                test_result["success"] = True
                                test_result["data_type"] = type(data).__name__
                                test_result["record_count"] = len(data) if isinstance(data, list) else 1
                                
                                # This is a successful combination!
                                results["successful_combinations"].append({
                                    "region": region,
                                    "base_url": base_url,
                                    "api_key": api_key,
                                    "key_format": key_type
                                })
                                
                                print(f"      🎉 WORKING COMBINATION FOUND!")
                                print(f"      📊 Data type: {type(data).__name__}")
                                if isinstance(data, list):
                                    print(f"      📋 Found {len(data)} items")
                                    
                                    # Show forms if any
                                    if data:
                                        print(f"      📝 Sample forms:")
                                        for i, form in enumerate(data[:3]):
                                            form_name = form.get('name', 'Unnamed')
                                            form_id = form.get('formId', 'No ID')
                                            print(f"         {i+1}. {form_name} (ID: {form_id})")
                                
                            except json.JSONDecodeError:
                                test_result["success"] = True
                                test_result["data_type"] = "text"
                                results["successful_combinations"].append({
                                    "region": region,
                                    "base_url": base_url,
                                    "api_key": api_key,
                                    "key_format": key_type
                                })
                                print(f"      🎉 SUCCESS (non-JSON response)")
                        
                        elif status == 400:
                            print(f"   ❌ BAD REQUEST: {status}")
                            try:
                                error_json = json.loads(response_text)
                                error_msg = error_json.get('message', 'Unknown error')
                                print(f"      Error: {error_msg}")
                                test_result["error_message"] = error_msg
                            except:
                                print(f"      Error: {response_text[:100]}...")
                        
                        elif status == 401:
                            print(f"   🚫 UNAUTHORIZED: {status}")
                            print(f"      Error: {response_text[:100]}...")
                        
                        else:
                            print(f"   ⚠️  STATUS: {status}")
                            print(f"      Response: {response_text[:100]}...")
                        
                        results["test_results"].append(test_result)
                        
                        # Small delay between tests
                        await asyncio.sleep(0.3)
                
                except Exception as e:
                    print(f"   💥 EXCEPTION: {str(e)}")
                    results["test_results"].append({
                        "region": region,
                        "base_url": base_url,
                        "api_key_format": key_type,
                        "error": str(e)
                    })
    
    # If we found working combinations, test them further
    if results["successful_combinations"]:
        print(f"\n🎉 SUCCESS! Working API combinations found:")
        
        for combo in results["successful_combinations"]:
            print(f"   ✅ {combo['region']} Region: {combo['key_format']}")
            print(f"      URL: {combo['base_url']}")
            print(f"      Key: {combo['api_key'][:15]}...")
        
        # Test the first working combination in detail
        working_combo = results["successful_combinations"][0]
        print(f"\n🔍 EXPLORING FIRST WORKING COMBINATION:")
        print(f"   🌍 Region: {working_combo['region']}")
        print(f"   🔑 Key: {working_combo['key_format']}")
        
        headers = {
            "Authorization": f"Bearer {working_combo['api_key']}",
            "Content-Type": "application/json"
        }
        
        try:
            async with aiohttp.ClientSession() as session:
                # Get forms
                forms_url = f"{working_combo['base_url']}/v1/api/forms"
                async with session.get(forms_url, headers=headers) as response:
                    if response.status == 200:
                        forms_data = await response.json()
                        
                        # Save successful data
                        success_file = f"fillout_eu_successful_forms_{working_combo['region'].lower()}.json"
                        with open(success_file, 'w', encoding='utf-8') as f:
                            json.dump(forms_data, f, indent=2, ensure_ascii=False)
                        
                        print(f"   💾 Forms data saved to: {success_file}")
                        
                        if isinstance(forms_data, list) and forms_data:
                            print(f"   📋 Found {len(forms_data)} forms total")
                            
                            # Show all forms
                            print(f"\n   📋 COMPLETE FORMS LIST:")
                            for i, form in enumerate(forms_data):
                                form_name = form.get('name', 'Unnamed Form')
                                form_id = form.get('formId', 'No ID')
                                print(f"      {i+1}. {form_name} (ID: {form_id})")
                            
                            # Test first form in detail if available
                            if forms_data:
                                first_form = forms_data[0]
                                form_id = first_form.get('formId')
                                form_name = first_form.get('name', 'Unknown')
                                
                                if form_id:
                                    print(f"\n   🔍 TESTING FORM DETAILS: {form_name}")
                                    
                                    # Get form metadata
                                    form_detail_url = f"{working_combo['base_url']}/v1/api/forms/{form_id}"
                                    async with session.get(form_detail_url, headers=headers) as detail_response:
                                        if detail_response.status == 200:
                                            form_detail = await detail_response.json()
                                            
                                            detail_file = f"fillout_eu_form_{form_id}_detail.json"
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
                                            submissions_url = f"{working_combo['base_url']}/v1/api/forms/{form_id}/submissions"
                                            async with session.get(submissions_url, headers=headers) as sub_response:
                                                if sub_response.status == 200:
                                                    submissions_data = await sub_response.json()
                                                    
                                                    sub_file = f"fillout_eu_form_{form_id}_submissions.json"
                                                    with open(sub_file, 'w', encoding='utf-8') as f:
                                                        json.dump(submissions_data, f, indent=2, ensure_ascii=False)
                                                    
                                                    print(f"      ✅ Submissions saved to: {sub_file}")
                                                    
                                                    if 'responses' in submissions_data:
                                                        responses = submissions_data['responses']
                                                        total = submissions_data.get('totalResponses', len(responses))
                                                        print(f"      📊 Form has {total} total submissions ({len(responses)} fetched)")
                                                        
                                                        # Show sample submission if available
                                                        if responses:
                                                            print(f"      📝 Sample submission answers:")
                                                            sample_sub = responses[0]
                                                            if 'questions' in sample_sub:
                                                                for q in sample_sub['questions'][:3]:  # First 3 answers
                                                                    q_name = q.get('name', 'Unknown')
                                                                    q_value = str(q.get('value', 'No value'))[:50]
                                                                    print(f"         • {q_name}: {q_value}")
                                                    
                                                    else:
                                                        print(f"      ℹ️  No submissions found")
                                                
                                                else:
                                                    print(f"      ⚠️  Submissions failed: {sub_response.status}")
                                        
                                        else:
                                            print(f"      ⚠️  Form details failed: {detail_response.status}")
                        
                        else:
                            print(f"   ⚠️  No forms found or unexpected data structure")
        
        except Exception as e:
            print(f"   💥 Error exploring working combination: {e}")
    
    # Save results
    output_file = "fillout_eu_api_test_results.json"
    with open(output_file, 'w', encoding='utf-8') as f:
        json.dump(results, f, indent=2, ensure_ascii=False)
    
    # Generate summary
    print(f"\n🎉 FILLOUT EU API TESTING COMPLETE!")
    print("=" * 60)
    
    successful_tests = [r for r in results["test_results"] if r.get("success", False)]
    failed_tests = [r for r in results["test_results"] if not r.get("success", False)]
    
    print(f"📊 SUMMARY:")
    print(f"   ✅ Successful combinations: {len(results['successful_combinations'])}")
    print(f"   ❌ Failed attempts: {len(failed_tests)}")
    print(f"   🧪 Total tests: {len(results['test_results'])}")
    
    if results["successful_combinations"]:
        print(f"\n🎯 WORKING CONFIGURATIONS:")
        for combo in results["successful_combinations"]:
            print(f"   ✅ {combo['region']} API + {combo['key_format']}")
        
        print(f"\n💡 RECOMMENDATION:")
        best_combo = results["successful_combinations"][0]
        print(f"   🌍 Use {best_combo['region']} endpoint: {best_combo['base_url']}")
        print(f"   🔑 Use {best_combo['key_format']}: {best_combo['api_key']}")
    else:
        print(f"\n📊 ERROR ANALYSIS:")
        error_patterns = {}
        for test in failed_tests:
            error = test.get('error_message', test.get('response', 'Unknown error'))[:50]
            if error not in error_patterns:
                error_patterns[error] = []
            error_patterns[error].append(f"{test.get('region', 'Unknown')} + {test.get('api_key_format', 'Unknown')}")
        
        for error, combinations in error_patterns.items():
            print(f"   ❌ '{error}': {len(combinations)} combinations")
    
    print(f"\n💾 Complete results saved to: {output_file}")
    
    return results

if __name__ == "__main__":
    asyncio.run(test_fillout_eu_api()) 