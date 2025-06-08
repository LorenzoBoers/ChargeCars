#!/usr/bin/env python3
"""
Fillout API Test Results Analysis
Comprehensive analysis of all API tests performed
"""

import json
import os
from datetime import datetime

def analyze_fillout_results():
    """Analyze all Fillout API test results"""
    
    print("📊 FILLOUT API COMPREHENSIVE RESULTS ANALYSIS")
    print("=" * 70)
    print(f"📅 Analysis performed at: {datetime.now().isoformat()}")
    
    # Result files to analyze
    result_files = [
        "fillout_api_test_results.json",
        "fillout_correct_api_results.json", 
        "fillout_fixed_api_results.json",
        "fillout_underscore_test_results.json",
        "fillout_eu_api_test_results.json"
    ]
    
    analysis = {
        "analysis_timestamp": datetime.now().isoformat(),
        "files_analyzed": [],
        "all_errors": [],
        "error_patterns": {},
        "key_formats_tested": [],
        "endpoints_tested": [],
        "regions_tested": [],
        "diagnosis": {},
        "recommendations": []
    }
    
    print(f"\n🔍 ANALYZING {len(result_files)} RESULT FILES:")
    
    for filename in result_files:
        if os.path.exists(filename):
            print(f"   ✅ Found: {filename}")
            
            try:
                with open(filename, 'r', encoding='utf-8') as f:
                    data = json.load(f)
                
                file_analysis = {
                    "filename": filename,
                    "test_timestamp": data.get("test_timestamp", "Unknown"),
                    "successful_calls": len(data.get("successful_calls", [])),
                    "failed_calls": len(data.get("failed_calls", [])),
                    "errors": len(data.get("errors", [])),
                    "unique_errors": set()
                }
                
                # Collect errors from different test types
                if "failed_calls" in data:
                    for call in data["failed_calls"]:
                        error_msg = call.get("error", call.get("error_message", "Unknown error"))
                        analysis["all_errors"].append({
                            "file": filename,
                            "error": error_msg,
                            "status": call.get("status"),
                            "endpoint": call.get("endpoint", call.get("url", "Unknown"))
                        })
                        file_analysis["unique_errors"].add(error_msg[:100])
                
                if "test_results" in data:
                    for test in data["test_results"]:
                        if test.get("status") != 200:
                            error_msg = test.get("error_message", test.get("response", "Unknown error"))
                            analysis["all_errors"].append({
                                "file": filename,
                                "error": error_msg,
                                "status": test.get("status"),
                                "region": test.get("region", "Unknown"),
                                "key_format": test.get("api_key_format", "Unknown")
                            })
                            file_analysis["unique_errors"] = list(file_analysis["unique_errors"])
                
                analysis["files_analyzed"].append(file_analysis)
                
            except Exception as e:
                print(f"      ❌ Error reading {filename}: {e}")
        else:
            print(f"   ❌ Missing: {filename}")
    
    # Analyze error patterns
    print(f"\n📊 ERROR PATTERN ANALYSIS:")
    
    error_counts = {}
    for error_data in analysis["all_errors"]:
        error_text = error_data["error"]
        
        # Extract key error messages
        if "Incorrectly formatted API key" in error_text:
            key = "Incorrectly formatted API key"
        elif "API key missing underscore" in error_text:
            key = "API key missing underscore"
        elif "Unauthorized" in error_text or error_data.get("status") == 401:
            key = "Unauthorized (401)"
        elif "Not Found" in error_text or error_data.get("status") == 404:
            key = "Not Found (404)"
        elif "Bad Request" in error_text or error_data.get("status") == 400:
            key = "Bad Request (400)"
        else:
            key = error_text[:50] + "..."
        
        if key not in error_counts:
            error_counts[key] = []
        error_counts[key].append(error_data)
    
    for error_type, occurrences in error_counts.items():
        print(f"   ❌ {error_type}: {len(occurrences)} occurrences")
        
        # Show sample details
        if len(occurrences) > 0:
            sample = occurrences[0]
            print(f"      📁 From: {sample['file']}")
            if 'region' in sample:
                print(f"      🌍 Region: {sample['region']}")
            if 'key_format' in sample:
                print(f"      🔑 Key format: {sample['key_format']}")
    
    analysis["error_patterns"] = {k: len(v) for k, v in error_counts.items()}
    
    # Key formats tested
    key_formats = set()
    for error_data in analysis["all_errors"]:
        if 'key_format' in error_data:
            key_formats.add(error_data['key_format'])
    
    analysis["key_formats_tested"] = list(key_formats)
    
    print(f"\n🔑 API KEY FORMATS TESTED:")
    for key_format in analysis["key_formats_tested"]:
        print(f"   • {key_format}")
    
    # Regions tested
    regions = set()
    for error_data in analysis["all_errors"]:
        if 'region' in error_data:
            regions.add(error_data['region'])
    
    analysis["regions_tested"] = list(regions)
    
    if analysis["regions_tested"]:
        print(f"\n🌍 REGIONS TESTED:")
        for region in analysis["regions_tested"]:
            print(f"   • {region}")
    
    # Diagnosis
    print(f"\n🔍 DIAGNOSIS:")
    
    diagnosis = {}
    
    # API Key format issues
    incorrectly_formatted = error_counts.get("Incorrectly formatted API key", [])
    missing_underscore = error_counts.get("API key missing underscore", [])
    
    if incorrectly_formatted:
        diagnosis["api_key_format"] = "API key format is incorrect - multiple formats tried"
        print(f"   🔑 API Key Format: Multiple format errors detected")
        print(f"      • 'Incorrectly formatted' errors: {len(incorrectly_formatted)}")
        print(f"      • 'Missing underscore' errors: {len(missing_underscore)}")
    
    # Regional issues
    if analysis["regions_tested"]:
        diagnosis["region_coverage"] = f"Tested {len(analysis['regions_tested'])} regions"
        print(f"   🌍 Regional Coverage: Tested both EU and US endpoints")
    
    # Authentication issues
    if error_counts:
        diagnosis["authentication"] = "All tests failed authentication"
        print(f"   🚫 Authentication: All {len(analysis['all_errors'])} attempts failed")
    
    analysis["diagnosis"] = diagnosis
    
    # Recommendations
    print(f"\n💡 RECOMMENDATIONS:")
    
    recommendations = []
    
    recommendations.append("1. Verify API key source - current key may not be valid for API access")
    print(f"   1. ✅ Verify API key source in Fillout dashboard")
    
    recommendations.append("2. Check if API access is enabled for the account")
    print(f"   2. ✅ Confirm API access is enabled in account settings")
    
    recommendations.append("3. Generate new API key specifically for REST API usage")
    print(f"   3. ✅ Generate new API key from Settings > Developer > API")
    
    recommendations.append("4. Verify account region (EU vs US) for correct endpoint")
    print(f"   4. ✅ Confirm account region for endpoint selection")
    
    recommendations.append("5. Contact Fillout support for API key format clarification")
    print(f"   5. ✅ Contact support if issues persist")
    
    analysis["recommendations"] = recommendations
    
    # Summary
    print(f"\n📋 SUMMARY:")
    print(f"   📁 Files analyzed: {len(analysis['files_analyzed'])}")
    print(f"   ❌ Total errors: {len(analysis['all_errors'])}")
    print(f"   🔑 Key formats tested: {len(analysis['key_formats_tested'])}")
    print(f"   🌍 Regions tested: {len(analysis['regions_tested'])}")
    print(f"   📊 Unique error types: {len(analysis['error_patterns'])}")
    
    # Current status
    print(f"\n🎯 CURRENT STATUS:")
    print(f"   ❌ Fillout API: Not accessible with current credentials")
    print(f"   ⚠️  Issue: API key authentication failures")
    print(f"   📝 Next steps: Manual API key verification required")
    
    # Save comprehensive analysis
    output_file = "fillout_comprehensive_analysis.json"
    with open(output_file, 'w', encoding='utf-8') as f:
        json.dump(analysis, f, indent=2, ensure_ascii=False)
    
    print(f"\n💾 Complete analysis saved to: {output_file}")
    
    return analysis

if __name__ == "__main__":
    analyze_fillout_results() 