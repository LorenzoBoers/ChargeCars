#!/usr/bin/env python3
"""
Complete Smartsuite Data Extraction for ChargeCars
"""

import asyncio
import aiohttp
import json
from datetime import datetime

async def extract_smartsuite_complete():
    """Complete extraction of all Smartsuite data"""
    
    api_key = "d99cf9b32aeaa64bdebb86e05da1d50e951246d6"
    workspace_id = "suhw2iz6"
    
    headers = {
        "Authorization": f"Token {api_key}",
        "Account-Id": workspace_id,
        "Content-Type": "application/json"
    }
    
    print("🚀 COMPLETE SMARTSUITE DATA EXTRACTION")
    print("=" * 50)
    
    extraction_data = {
        "extraction_timestamp": datetime.now().isoformat(),
        "workspace_id": workspace_id,
        "applications": [],
        "records_by_app": {},
        "summary": {}
    }
    
    async with aiohttp.ClientSession() as session:
        # Step 1: Get all applications
        print("📋 Step 1: Extracting all applications...")
        try:
            async with session.get("https://app.smartsuite.com/api/v1/applications", headers=headers) as response:
                if response.status == 200:
                    applications = await response.json()
                    extraction_data["applications"] = applications
                    print(f"✅ Found {len(applications)} applications")
                    
                    # Show application names
                    for app in applications:
                        print(f"   - {app.get('name', 'Unknown')} (ID: {app.get('id', 'Unknown')})")
                else:
                    print(f"❌ Failed to get applications: {response.status}")
                    return
        except Exception as e:
            print(f"💥 Error getting applications: {e}")
            return
        
        # Step 2: Extract records from each application
        print(f"\n📊 Step 2: Extracting records from each application...")
        
        total_records = 0
        for app in applications:
            app_id = app.get('id')
            app_name = app.get('name', 'Unknown')
            
            print(f"\n🔍 Extracting from: {app_name}")
            
            try:
                # Get records from this application
                records_url = f"https://app.smartsuite.com/api/v1/applications/{app_id}/records"
                async with session.get(records_url, headers=headers) as response:
                    if response.status == 200:
                        records_data = await response.json()
                        records = records_data.get('items', [])
                        
                        extraction_data["records_by_app"][app_name] = {
                            "app_id": app_id,
                            "app_info": app,
                            "records": records,
                            "record_count": len(records)
                        }
                        
                        total_records += len(records)
                        print(f"   ✅ {len(records)} records extracted")
                        
                        # Show sample record structure
                        if records:
                            sample_record = records[0]
                            fields = list(sample_record.keys())
                            print(f"   📝 Sample fields: {fields[:5]}{'...' if len(fields) > 5 else ''}")
                    
                    elif response.status == 404:
                        print(f"   ⚠️  No records endpoint for {app_name}")
                    else:
                        print(f"   ❌ Failed to get records: {response.status}")
                        
            except Exception as e:
                print(f"   💥 Error extracting {app_name}: {e}")
        
        # Step 3: Try to get automation/workflow data
        print(f"\n⚙️  Step 3: Attempting to extract automations...")
        automation_endpoints = [
            "https://app.smartsuite.com/api/v1/automations",
            "https://app.smartsuite.com/api/v1/workflows", 
            f"https://app.smartsuite.com/api/v1/workspaces/{workspace_id}/automations"
        ]
        
        for endpoint in automation_endpoints:
            try:
                async with session.get(endpoint, headers=headers) as response:
                    if response.status == 200:
                        automations = await response.json()
                        extraction_data["automations"] = automations
                        print(f"   ✅ Found automations at {endpoint}")
                        break
                    else:
                        print(f"   ❌ {endpoint}: Status {response.status}")
            except Exception as e:
                print(f"   💥 {endpoint}: {e}")
    
    # Generate summary
    extraction_data["summary"] = {
        "total_applications": len(applications),
        "total_records": total_records,
        "applications_with_data": len([app for app in extraction_data["records_by_app"].values() if app["record_count"] > 0]),
        "largest_application": max(extraction_data["records_by_app"].items(), key=lambda x: x[1]["record_count"]) if extraction_data["records_by_app"] else None
    }
    
    # Save results
    output_file = "smartsuite_complete_extraction.json"
    with open(output_file, 'w', encoding='utf-8') as f:
        json.dump(extraction_data, f, indent=2, ensure_ascii=False)
    
    print(f"\n✅ EXTRACTION COMPLETE!")
    print(f"📊 Summary:")
    print(f"   - Applications: {extraction_data['summary']['total_applications']}")
    print(f"   - Total Records: {extraction_data['summary']['total_records']}")
    print(f"   - Apps with Data: {extraction_data['summary']['applications_with_data']}")
    
    if extraction_data['summary']['largest_application']:
        largest_app_name, largest_app_data = extraction_data['summary']['largest_application']
        print(f"   - Largest App: {largest_app_name} ({largest_app_data['record_count']} records)")
    
    print(f"💾 Data saved to: {output_file}")
    
    return extraction_data

if __name__ == "__main__":
    asyncio.run(extract_smartsuite_complete()) 