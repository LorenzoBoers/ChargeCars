#!/usr/bin/env python3
"""
Correct Smartsuite API Implementation based on official documentation
"""

import asyncio
import aiohttp
import json
from datetime import datetime

async def extract_smartsuite_correct():
    """Extract Smartsuite data using correct API endpoints"""
    
    api_key = "d99cf9b32aeaa64bdebb86e05da1d50e951246d6"
    workspace_id = "suhw2iz6"
    
    headers = {
        "Authorization": f"Token {api_key}",
        "Account-Id": workspace_id,
        "Content-Type": "application/json"
    }
    
    print("🚀 SMARTSUITE CORRECT API EXTRACTION")
    print("=" * 50)
    print("📚 Using official API documentation endpoints")
    
    extraction_data = {
        "extraction_timestamp": datetime.now().isoformat(),
        "workspace_id": workspace_id,
        "tables": [],
        "records_by_table": {},
        "summary": {}
    }
    
    async with aiohttp.ClientSession() as session:
        # Step 1: Get all tables (formerly called applications)
        print("\n📋 Step 1: Getting all tables...")
        try:
            async with session.get("https://app.smartsuite.com/api/v1/applications", headers=headers) as response:
                if response.status == 200:
                    tables = await response.json()
                    extraction_data["tables"] = tables
                    print(f"✅ Found {len(tables)} tables")
                    
                    # Show first 10 table names
                    for i, table in enumerate(tables[:10]):
                        print(f"   {i+1}. {table.get('name', 'Unknown')} (ID: {table.get('id', 'Unknown')})")
                    if len(tables) > 10:
                        print(f"   ... and {len(tables) - 10} more tables")
                else:
                    print(f"❌ Failed to get tables: {response.status}")
                    return
        except Exception as e:
            print(f"💥 Error getting tables: {e}")
            return
        
        # Step 2: Extract records using correct POST endpoint
        print(f"\n📊 Step 2: Extracting records using POST /records/list/ endpoint...")
        
        total_records = 0
        successful_extractions = 0
        
        # Test with first 5 tables to avoid rate limits
        test_tables = tables[:5]
        
        for table in test_tables:
            table_id = table.get('id')
            table_name = table.get('name', 'Unknown')
            
            print(f"\n🔍 Extracting from: {table_name}")
            
            try:
                # Use correct POST endpoint for records
                records_url = f"https://app.smartsuite.com/api/v1/applications/{table_id}/records/list/"
                
                # POST request with empty filter (gets all records)
                request_body = {
                    "filter": {},
                    "sort": [],
                    "limit": 100  # Start with 100 records per table
                }
                
                async with session.post(records_url, headers=headers, json=request_body) as response:
                    if response.status == 200:
                        records_data = await response.json()
                        records = records_data.get('items', [])
                        
                        extraction_data["records_by_table"][table_name] = {
                            "table_id": table_id,
                            "table_info": table,
                            "records": records,
                            "record_count": len(records),
                            "total_count": records_data.get('total_count', len(records))
                        }
                        
                        total_records += len(records)
                        successful_extractions += 1
                        print(f"   ✅ {len(records)} records extracted (Total: {records_data.get('total_count', 'Unknown')})")
                        
                        # Show sample record structure
                        if records:
                            sample_record = records[0]
                            fields = list(sample_record.keys())
                            print(f"   📝 Sample fields: {fields[:5]}{'...' if len(fields) > 5 else ''}")
                            
                            # Show some actual field values for key operational tables
                            if any(keyword in table_name.lower() for keyword in ['order', 'werkbon', 'klant', 'product', 'team']):
                                print(f"   🔍 Key table detected - Sample data:")
                                for field in fields[:3]:
                                    value = sample_record.get(field)
                                    if isinstance(value, str) and len(value) < 50:
                                        print(f"      {field}: {value}")
                    
                    elif response.status == 404:
                        print(f"   ⚠️  Table not found or no access")
                    elif response.status == 403:
                        print(f"   ⚠️  Access forbidden - check permissions")
                    else:
                        error_text = await response.text()
                        print(f"   ❌ Status {response.status}: {error_text[:100]}")
                        
            except Exception as e:
                print(f"   💥 Error extracting {table_name}: {e}")
        
        # Step 3: Get table structures for important tables
        print(f"\n🏗️  Step 3: Getting table structures for key operational tables...")
        
        key_tables = [table for table in tables if any(keyword in table.get('name', '').lower() 
                     for keyword in ['order', 'werkbon', 'klant', 'product', 'team', 'bezoek'])]
        
        for table in key_tables[:3]:  # Limit to 3 to avoid rate limits
            table_id = table.get('id')
            table_name = table.get('name', 'Unknown')
            
            try:
                structure_url = f"https://app.smartsuite.com/api/v1/applications/{table_id}/"
                async with session.get(structure_url, headers=headers) as response:
                    if response.status == 200:
                        structure_data = await response.json()
                        if table_name in extraction_data["records_by_table"]:
                            extraction_data["records_by_table"][table_name]["structure"] = structure_data.get('structure', [])
                        print(f"   ✅ Structure for {table_name}: {len(structure_data.get('structure', []))} fields")
                    else:
                        print(f"   ❌ Structure for {table_name}: Status {response.status}")
            except Exception as e:
                print(f"   💥 Error getting structure for {table_name}: {e}")
    
    # Generate summary
    extraction_data["summary"] = {
        "total_tables": len(tables),
        "total_records": total_records,
        "successful_extractions": successful_extractions,
        "tables_with_data": len([table for table in extraction_data["records_by_table"].values() if table["record_count"] > 0]),
        "largest_table": max(extraction_data["records_by_table"].items(), key=lambda x: x[1]["record_count"]) if extraction_data["records_by_table"] else None
    }
    
    # Save results
    output_file = "smartsuite_correct_extraction.json"
    with open(output_file, 'w', encoding='utf-8') as f:
        json.dump(extraction_data, f, indent=2, ensure_ascii=False)
    
    print(f"\n✅ EXTRACTION COMPLETE!")
    print(f"📊 Summary:")
    print(f"   - Total Tables: {extraction_data['summary']['total_tables']}")
    print(f"   - Successful Extractions: {extraction_data['summary']['successful_extractions']}")
    print(f"   - Total Records: {extraction_data['summary']['total_records']}")
    print(f"   - Tables with Data: {extraction_data['summary']['tables_with_data']}")
    
    if extraction_data['summary']['largest_table']:
        largest_table_name, largest_table_data = extraction_data['summary']['largest_table']
        print(f"   - Largest Table: {largest_table_name} ({largest_table_data['record_count']} records)")
    
    print(f"💾 Data saved to: {output_file}")
    
    # Show key operational tables found
    operational_tables = [name for name in extraction_data["records_by_table"].keys() 
                         if any(keyword in name.lower() for keyword in ['order', 'werkbon', 'klant', 'product', 'team', 'bezoek'])]
    
    if operational_tables:
        print(f"\n🎯 Key Operational Tables Found:")
        for table_name in operational_tables:
            table_data = extraction_data["records_by_table"][table_name]
            print(f"   - {table_name}: {table_data['record_count']} records")
    
    return extraction_data

if __name__ == "__main__":
    asyncio.run(extract_smartsuite_correct()) 