#!/usr/bin/env python3
"""
Complete Smartsuite Operational Data Extraction for ChargeCars
Focus on all operational tables with proper rate limiting
"""

import asyncio
import aiohttp
import json
from datetime import datetime
import time

async def extract_smartsuite_operational():
    """Extract all operational data from Smartsuite with rate limiting"""
    
    api_key = "d99cf9b32aeaa64bdebb86e05da1d50e951246d6"
    workspace_id = "suhw2iz6"
    
    headers = {
        "Authorization": f"Token {api_key}",
        "Account-Id": workspace_id,
        "Content-Type": "application/json"
    }
    
    print("🚀 COMPLETE SMARTSUITE OPERATIONAL EXTRACTION")
    print("=" * 60)
    print("📚 Extracting ALL operational tables with rate limiting")
    
    extraction_data = {
        "extraction_timestamp": datetime.now().isoformat(),
        "workspace_id": workspace_id,
        "tables": [],
        "records_by_table": {},
        "summary": {}
    }
    
    async with aiohttp.ClientSession() as session:
        # Step 1: Get all tables
        print("\n📋 Step 1: Getting all tables...")
        try:
            async with session.get("https://app.smartsuite.com/api/v1/applications", headers=headers) as response:
                if response.status == 200:
                    tables = await response.json()
                    extraction_data["tables"] = tables
                    print(f"✅ Found {len(tables)} tables total")
                else:
                    print(f"❌ Failed to get tables: {response.status}")
                    return
        except Exception as e:
            print(f"💥 Error getting tables: {e}")
            return
        
        # Step 2: Identify operational tables
        operational_keywords = [
            'order', 'werkbon', 'klant', 'product', 'team', 'bezoek', 'agenda',
            'factuur', 'offerte', 'lead', 'organisatie', 'eindklant', 'member',
            'voorraden', 'bestelling', 'registratie', 'machtiging', 'betaling'
        ]
        
        operational_tables = []
        for table in tables:
            table_name = table.get('name', '').lower()
            if any(keyword in table_name for keyword in operational_keywords):
                operational_tables.append(table)
        
        print(f"\n🎯 Found {len(operational_tables)} operational tables:")
        for table in operational_tables:
            print(f"   - {table.get('name', 'Unknown')}")
        
        # Step 3: Extract records from operational tables
        print(f"\n📊 Step 3: Extracting records from operational tables...")
        print(f"⏱️  Rate limit: 5 requests/second (waiting 0.2s between requests)")
        
        total_records = 0
        successful_extractions = 0
        
        for i, table in enumerate(operational_tables):
            table_id = table.get('id')
            table_name = table.get('name', 'Unknown')
            
            print(f"\n🔍 [{i+1}/{len(operational_tables)}] Extracting: {table_name}")
            
            try:
                # Rate limiting: 5 requests per second
                if i > 0:
                    await asyncio.sleep(0.2)
                
                records_url = f"https://app.smartsuite.com/api/v1/applications/{table_id}/records/list/"
                
                # Request more records for important tables
                limit = 500 if any(keyword in table_name.lower() for keyword in ['bezoek', 'werkbon', 'order', 'klant']) else 100
                
                request_body = {
                    "filter": {},
                    "sort": [],
                    "limit": limit
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
                        
                        total_in_table = records_data.get('total_count', len(records))
                        print(f"   ✅ {len(records)} records extracted (Total in table: {total_in_table})")
                        
                        # Show sample data for key tables
                        if records and any(keyword in table_name.lower() for keyword in ['bezoek', 'werkbon', 'order', 'klant', 'product']):
                            sample_record = records[0]
                            fields = list(sample_record.keys())
                            print(f"   📝 Fields ({len(fields)}): {fields[:8]}{'...' if len(fields) > 8 else ''}")
                            
                            # Show key field values
                            key_fields = ['name', 'status', 'type', 'datum', 'klant', 'product', 'team']
                            for field in key_fields:
                                if field in sample_record:
                                    value = sample_record.get(field)
                                    if isinstance(value, (str, int, float)) and str(value) and len(str(value)) < 50:
                                        print(f"      {field}: {value}")
                    
                    elif response.status == 429:
                        print(f"   ⚠️  Rate limited - waiting 30 seconds...")
                        await asyncio.sleep(30)
                        # Retry the request
                        async with session.post(records_url, headers=headers, json=request_body) as retry_response:
                            if retry_response.status == 200:
                                print(f"   ✅ Retry successful")
                            else:
                                print(f"   ❌ Retry failed: {retry_response.status}")
                    
                    elif response.status == 404:
                        print(f"   ⚠️  Table not found or no access")
                    elif response.status == 403:
                        print(f"   ⚠️  Access forbidden")
                    else:
                        error_text = await response.text()
                        print(f"   ❌ Status {response.status}: {error_text[:100]}")
                        
            except Exception as e:
                print(f"   💥 Error extracting {table_name}: {e}")
        
        # Step 4: Get structures for the most important tables
        print(f"\n🏗️  Step 4: Getting table structures for key tables...")
        
        key_table_names = ['Bezoeken', 'Werkbonnen', 'Orders', 'Eindklanten', 'Teams', 'Producten']
        key_tables = [table for table in operational_tables 
                     if any(key_name.lower() in table.get('name', '').lower() for key_name in key_table_names)]
        
        for table in key_tables:
            table_id = table.get('id')
            table_name = table.get('name', 'Unknown')
            
            try:
                await asyncio.sleep(0.2)  # Rate limiting
                
                structure_url = f"https://app.smartsuite.com/api/v1/applications/{table_id}/"
                async with session.get(structure_url, headers=headers) as response:
                    if response.status == 200:
                        structure_data = await response.json()
                        if table_name in extraction_data["records_by_table"]:
                            extraction_data["records_by_table"][table_name]["structure"] = structure_data.get('structure', [])
                        print(f"   ✅ {table_name}: {len(structure_data.get('structure', []))} fields")
                    else:
                        print(f"   ❌ {table_name}: Status {response.status}")
            except Exception as e:
                print(f"   💥 Error getting structure for {table_name}: {e}")
    
    # Generate comprehensive summary
    extraction_data["summary"] = {
        "total_tables": len(tables),
        "operational_tables": len(operational_tables),
        "total_records": total_records,
        "successful_extractions": successful_extractions,
        "tables_with_data": len([table for table in extraction_data["records_by_table"].values() if table["record_count"] > 0]),
        "largest_table": max(extraction_data["records_by_table"].items(), key=lambda x: x[1]["record_count"]) if extraction_data["records_by_table"] else None,
        "extraction_rate": f"{successful_extractions}/{len(operational_tables)} tables"
    }
    
    # Save results
    output_file = "smartsuite_operational_complete.json"
    with open(output_file, 'w', encoding='utf-8') as f:
        json.dump(extraction_data, f, indent=2, ensure_ascii=False)
    
    print(f"\n🎉 COMPLETE OPERATIONAL EXTRACTION FINISHED!")
    print(f"=" * 60)
    print(f"📊 Final Summary:")
    print(f"   - Total Tables in Workspace: {extraction_data['summary']['total_tables']}")
    print(f"   - Operational Tables Identified: {extraction_data['summary']['operational_tables']}")
    print(f"   - Successful Extractions: {extraction_data['summary']['extraction_rate']}")
    print(f"   - Total Records Extracted: {extraction_data['summary']['total_records']}")
    print(f"   - Tables with Data: {extraction_data['summary']['tables_with_data']}")
    
    if extraction_data['summary']['largest_table']:
        largest_table_name, largest_table_data = extraction_data['summary']['largest_table']
        print(f"   - Largest Table: {largest_table_name} ({largest_table_data['record_count']} records)")
    
    print(f"\n💾 Complete data saved to: {output_file}")
    
    # Show all operational tables with record counts
    print(f"\n🎯 All Operational Tables Extracted:")
    for table_name, table_data in extraction_data["records_by_table"].items():
        total_count = table_data.get('total_count', table_data['record_count'])
        print(f"   - {table_name}: {table_data['record_count']} extracted (Total: {total_count})")
    
    return extraction_data

if __name__ == "__main__":
    asyncio.run(extract_smartsuite_operational()) 