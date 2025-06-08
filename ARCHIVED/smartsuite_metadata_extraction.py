#!/usr/bin/env python3
"""
Smartsuite Metadata API Extraction for ChargeCars
Extract table relationships, field structures, and metadata using official metadata endpoints
"""

import asyncio
import aiohttp
import json
from datetime import datetime

async def extract_smartsuite_metadata():
    """Extract complete metadata from Smartsuite including relationships"""
    
    api_key = "d99cf9b32aeaa64bdebb86e05da1d50e951246d6"
    workspace_id = "suhw2iz6"
    
    headers = {
        "Authorization": f"Token {api_key}",
        "Account-Id": workspace_id,
        "Content-Type": "application/json"
    }
    
    print("🔍 SMARTSUITE METADATA API EXTRACTION")
    print("=" * 60)
    print("📚 Using official metadata API to discover table relationships")
    
    metadata = {
        "extraction_timestamp": datetime.now().isoformat(),
        "workspace_id": workspace_id,
        "solutions": [],
        "applications": [],
        "members": [],
        "field_relationships": {},
        "table_connections": {},
        "summary": {}
    }
    
    async with aiohttp.ClientSession() as session:
        # Step 1: Get Solutions (high-level groupings)
        print("\n📋 Step 1: Getting Solutions...")
        try:
            async with session.get("https://app.smartsuite.com/api/v1/solutions/", headers=headers) as response:
                if response.status == 200:
                    solutions = await response.json()
                    metadata["solutions"] = solutions.get('items', solutions) if isinstance(solutions, dict) else solutions
                    print(f"✅ Found {len(metadata['solutions'])} solutions")
                    
                    for solution in metadata["solutions"]:
                        print(f"   - {solution.get('name', 'Unknown')} (ID: {solution.get('id', 'Unknown')})")
                else:
                    print(f"❌ Failed to get solutions: {response.status}")
        except Exception as e:
            print(f"💥 Error getting solutions: {e}")
        
        # Step 2: Get detailed application metadata
        print("\n🏗️  Step 2: Getting detailed application metadata...")
        try:
            async with session.get("https://app.smartsuite.com/api/v1/applications", headers=headers) as response:
                if response.status == 200:
                    applications = await response.json()
                    metadata["applications"] = applications
                    print(f"✅ Found {len(applications)} applications")
                else:
                    print(f"❌ Failed to get applications: {response.status}")
                    return
        except Exception as e:
            print(f"💥 Error getting applications: {e}")
            return
        
        # Step 3: Get detailed field structures for each application
        print("\n🔗 Step 3: Analyzing field structures and relationships...")
        
        operational_keywords = [
            'order', 'werkbon', 'klant', 'product', 'team', 'bezoek', 'agenda',
            'factuur', 'offerte', 'lead', 'organisatie', 'eindklant', 'member'
        ]
        
        operational_apps = [app for app in applications 
                           if any(keyword in app.get('name', '').lower() for keyword in operational_keywords)]
        
        print(f"🎯 Analyzing {len(operational_apps)} operational applications for relationships...")
        
        for i, app in enumerate(operational_apps):
            app_id = app.get('id')
            app_name = app.get('name', 'Unknown')
            
            print(f"\n🔍 [{i+1}/{len(operational_apps)}] Analyzing: {app_name}")
            
            try:
                # Rate limiting
                if i > 0:
                    await asyncio.sleep(0.2)
                
                # Get detailed application structure
                structure_url = f"https://app.smartsuite.com/api/v1/applications/{app_id}/"
                async with session.get(structure_url, headers=headers) as response:
                    if response.status == 200:
                        app_details = await response.json()
                        structure = app_details.get('structure', [])
                        
                        # Analyze field relationships
                        relationships = []
                        linked_fields = []
                        reference_fields = []
                        
                        for field in structure:
                            field_type = field.get('field_type', '')
                            field_slug = field.get('slug', '')
                            field_label = field.get('label', '')
                            
                            # Look for relationship fields
                            if field_type in ['linkedrecordfield', 'applicationfield', 'memberfield']:
                                relationships.append({
                                    'field_slug': field_slug,
                                    'field_label': field_label,
                                    'field_type': field_type,
                                    'params': field.get('params', {})
                                })
                                
                                # Extract target application if available
                                params = field.get('params', {})
                                target_app = params.get('foreign_table_id') or params.get('application_id')
                                if target_app:
                                    linked_fields.append({
                                        'source_app': app_name,
                                        'source_field': field_label,
                                        'target_app_id': target_app,
                                        'field_type': field_type
                                    })
                        
                        metadata["field_relationships"][app_name] = {
                            "app_id": app_id,
                            "total_fields": len(structure),
                            "relationship_fields": relationships,
                            "linked_fields": linked_fields,
                            "structure": structure
                        }
                        
                        print(f"   ✅ {len(structure)} fields analyzed")
                        print(f"   🔗 {len(relationships)} relationship fields found")
                        
                        if relationships:
                            print(f"   📋 Relationship fields:")
                            for rel in relationships[:3]:  # Show first 3
                                print(f"      - {rel['field_label']} ({rel['field_type']})")
                            if len(relationships) > 3:
                                print(f"      ... and {len(relationships) - 3} more")
                    
                    else:
                        print(f"   ❌ Failed to get structure: {response.status}")
                        
            except Exception as e:
                print(f"   💥 Error analyzing {app_name}: {e}")
        
        # Step 4: Get workspace members
        print("\n👥 Step 4: Getting workspace members...")
        try:
            async with session.get("https://app.smartsuite.com/api/v1/members/", headers=headers) as response:
                if response.status == 200:
                    members_data = await response.json()
                    members = members_data.get('items', members_data) if isinstance(members_data, dict) else members_data
                    metadata["members"] = members
                    print(f"✅ Found {len(members)} workspace members")
                else:
                    print(f"❌ Failed to get members: {response.status}")
        except Exception as e:
            print(f"💥 Error getting members: {e}")
        
        # Step 5: Build table connection map
        print("\n🗺️  Step 5: Building table connection map...")
        
        # Create app ID to name mapping
        app_id_to_name = {app.get('id'): app.get('name') for app in applications}
        
        connections = {}
        for app_name, app_data in metadata["field_relationships"].items():
            connections[app_name] = []
            
            for linked_field in app_data.get("linked_fields", []):
                target_app_id = linked_field.get("target_app_id")
                target_app_name = app_id_to_name.get(target_app_id, f"Unknown ({target_app_id})")
                
                connections[app_name].append({
                    "target_table": target_app_name,
                    "connection_field": linked_field.get("source_field"),
                    "connection_type": linked_field.get("field_type")
                })
        
        metadata["table_connections"] = connections
        
        # Show connection summary
        print(f"🔗 Table connections discovered:")
        for source_table, connections_list in connections.items():
            if connections_list:
                print(f"   📋 {source_table}:")
                for conn in connections_list:
                    print(f"      → {conn['target_table']} (via {conn['connection_field']})")
    
    # Generate comprehensive summary
    total_relationships = sum(len(app_data.get("relationship_fields", [])) 
                            for app_data in metadata["field_relationships"].values())
    
    total_connections = sum(len(connections_list) 
                          for connections_list in metadata["table_connections"].values())
    
    metadata["summary"] = {
        "total_solutions": len(metadata["solutions"]),
        "total_applications": len(metadata["applications"]),
        "analyzed_applications": len(metadata["field_relationships"]),
        "total_members": len(metadata["members"]),
        "total_relationship_fields": total_relationships,
        "total_table_connections": total_connections
    }
    
    # Save results
    output_file = "smartsuite_metadata_complete.json"
    with open(output_file, 'w', encoding='utf-8') as f:
        json.dump(metadata, f, indent=2, ensure_ascii=False)
    
    print(f"\n🎉 METADATA EXTRACTION COMPLETE!")
    print(f"=" * 60)
    print(f"📊 Summary:")
    print(f"   - Solutions: {metadata['summary']['total_solutions']}")
    print(f"   - Applications: {metadata['summary']['total_applications']}")
    print(f"   - Analyzed Applications: {metadata['summary']['analyzed_applications']}")
    print(f"   - Workspace Members: {metadata['summary']['total_members']}")
    print(f"   - Relationship Fields: {metadata['summary']['total_relationship_fields']}")
    print(f"   - Table Connections: {metadata['summary']['total_table_connections']}")
    
    print(f"\n💾 Complete metadata saved to: {output_file}")
    
    # Show key operational relationships
    print(f"\n🎯 KEY OPERATIONAL TABLE RELATIONSHIPS:")
    key_tables = ['Bezoeken', 'Orders', 'Eindklanten', 'Werkbonnen', 'Offertes', 'Organisaties']
    
    for table_name in key_tables:
        if table_name in metadata["table_connections"]:
            connections_list = metadata["table_connections"][table_name]
            if connections_list:
                print(f"   📋 {table_name}:")
                for conn in connections_list:
                    print(f"      → {conn['target_table']} (via {conn['connection_field']})")
    
    return metadata

if __name__ == "__main__":
    asyncio.run(extract_smartsuite_metadata()) 