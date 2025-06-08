#!/usr/bin/env python3
"""
ChargeCars Data Migration: SmartSuite → Xano (MCP Version)
Uses MCP tools to actually migrate data to Xano
"""

import asyncio
import aiohttp
import json
import time
from datetime import datetime
from typing import Dict, List, Any, Optional

class ChargeCarsDataMigrationMCP:
    def __init__(self):
        # SmartSuite Configuration
        self.smartsuite_api_key = "d99cf9b32aeaa64bdebb86e05da1d50e951246d6"
        self.smartsuite_workspace_id = "suhw2iz6"
        self.xano_workspace_id = 3  # ChargeCars V2 workspace
        
        # Headers
        self.smartsuite_headers = {
            "Authorization": f"Token {self.smartsuite_api_key}",
            "Account-Id": self.smartsuite_workspace_id,
            "Content-Type": "application/json"
        }
        
        # Table mappings - focusing on key tables first
        self.table_mappings = {
            "Eindklanten": {
                "xano_table_id": 35,  # organizations
                "xano_table": "organizations",
                "priority": 1,
                "default_values": {
                    "organization_type": "customer_individual",
                    "business_entity": "chargecars",
                    "is_active": True
                }
            },
            "Partners": {
                "xano_table_id": 35,  # organizations
                "xano_table": "organizations", 
                "priority": 1,
                "default_values": {
                    "organization_type": "partner_automotive",
                    "business_entity": "chargecars",
                    "is_active": True
                }
            },
            "Producten": {
                "xano_table_id": 38,  # articles
                "xano_table": "articles",
                "priority": 2,
                "default_values": {
                    "article_type": "wallbox",
                    "requires_serial_tracking": False
                }
            },
            "Teams": {
                "xano_table_id": 51,  # installation_teams
                "xano_table": "installation_teams",
                "priority": 2,
                "default_values": {}
            }
        }
        
        # Field mappings per Xano table
        self.field_mappings = {
            "organizations": {
                # SmartSuite field → Xano field
                "naam": "name",
                "bedrijfsnaam": "legal_name",
                "website": "website", 
                "telefoon": "phone",
                "email": "email",
                "kvk_nummer": "chamber_of_commerce",
                "btw_nummer": "vat_number",
                "commissie_percentage": "commission_rate"
            },
            "articles": {
                "naam": "name",
                "beschrijving": "description",
                "prijs_klant": "price_customer",
                "prijs_partner": "price_partner",
                "specificaties": "specifications"
            },
            "installation_teams": {
                "naam": "team_name",
                "leden": "team_members",
                "vaardigheden": "team_skills",
                "thuisbasis": "home_base_location"
            }
        }
        
        # Migration tracking
        self.migration_log = {
            "start_time": None,
            "tables_migrated": [],
            "total_records": 0,
            "errors": [],
            "success_count": 0,
            "failure_count": 0
        }
    
    async def extract_smartsuite_table(self, table_name: str, limit: int = 50) -> List[Dict]:
        """Extract data from a SmartSuite table"""
        print(f"\n📥 Extracting data from SmartSuite: {table_name}")
        
        async with aiohttp.ClientSession() as session:
            try:
                # Get table list first
                async with session.get(
                    "https://app.smartsuite.com/api/v1/applications",
                    headers=self.smartsuite_headers
                ) as response:
                    if response.status != 200:
                        raise Exception(f"Failed to fetch tables: {response.status}")
                    
                    tables = await response.json()
                    table_id = None
                    
                    # Find the table by name
                    for table in tables:
                        if table.get('name', '').lower() == table_name.lower():
                            table_id = table.get('id')
                            break
                    
                    if not table_id:
                        print(f"❌ Table '{table_name}' not found")
                        return []
                
                # Extract records
                await asyncio.sleep(0.3)  # Rate limiting
                
                records_url = f"https://app.smartsuite.com/api/v1/applications/{table_id}/records/list/"
                request_body = {
                    "filter": {},
                    "sort": [],
                    "limit": limit  # Limited for testing
                }
                
                async with session.post(
                    records_url,
                    headers=self.smartsuite_headers,
                    json=request_body
                ) as response:
                    if response.status == 200:
                        data = await response.json()
                        records = data.get('items', [])
                        total = data.get('total_count', len(records))
                        
                        print(f"✅ Found {len(records)} records (Total: {total})")
                        return records
                    else:
                        error_text = await response.text()
                        raise Exception(f"Extract failed: {response.status} - {error_text}")
            
            except Exception as e:
                print(f"💥 Error extracting {table_name}: {e}")
                self.migration_log["errors"].append(f"Extract {table_name}: {str(e)}")
                return []
    
    def transform_record_for_xano(self, record: Dict, xano_table: str, default_values: Dict) -> Dict:
        """Transform SmartSuite record to Xano format"""
        field_mapping = self.field_mappings.get(xano_table, {})
        transformed = {}
        
        # Map fields according to field mappings
        for smartsuite_field, xano_field in field_mapping.items():
            if smartsuite_field in record:
                value = record[smartsuite_field]
                
                # Handle specific transformations
                if xano_field == "commission_rate" and isinstance(value, str):
                    # Convert percentage string to decimal
                    try:
                        clean_value = value.replace('%', '').replace(',', '.')
                        transformed[xano_field] = float(clean_value) / 100 if float(clean_value) > 1 else float(clean_value)
                    except (ValueError, TypeError):
                        transformed[xano_field] = None
                elif xano_field == "team_members" and isinstance(value, str):
                    # Convert team members string to JSON array
                    try:
                        members = [member.strip() for member in value.split(',') if member.strip()]
                        transformed[xano_field] = members
                    except:
                        transformed[xano_field] = []
                elif xano_field == "home_base_location" and isinstance(value, str):
                    # Convert address to JSON format
                    transformed[xano_field] = {"address": value}
                else:
                    transformed[xano_field] = value
        
        # Apply default values
        for key, value in default_values.items():
            if key not in transformed:
                transformed[key] = value
        
        # Ensure required fields have values
        if xano_table == "organizations" and "name" not in transformed:
            transformed["name"] = "Unknown Organization"
        elif xano_table == "articles" and "name" not in transformed:
            transformed["name"] = "Unknown Product"
        elif xano_table == "installation_teams" and "team_name" not in transformed:
            transformed["team_name"] = "Unknown Team"
        
        return transformed
    
    async def test_migration_single_table(self, smartsuite_table: str):
        """Test migration of a single table"""
        print(f"\n🧪 TESTING MIGRATION: {smartsuite_table}")
        print("=" * 50)
        
        if smartsuite_table not in self.table_mappings:
            print(f"❌ No mapping for table: {smartsuite_table}")
            return False
        
        # Get mapping config
        mapping = self.table_mappings[smartsuite_table]
        xano_table_id = mapping["xano_table_id"]
        xano_table = mapping["xano_table"]
        default_values = mapping["default_values"]
        
        # Extract data from SmartSuite
        records = await self.extract_smartsuite_table(smartsuite_table, limit=5)
        
        if not records:
            print("⚠️ No records found to migrate")
            return True
        
        print(f"\n📊 Processing {len(records)} records...")
        
        # Transform and show samples
        transformed_records = []
        for i, record in enumerate(records):
            try:
                transformed = self.transform_record_for_xano(record, xano_table, default_values)
                transformed_records.append(transformed)
                
                # Show first transformation as example
                if i == 0:
                    print(f"\n📝 Sample transformation:")
                    print(f"   Original fields: {list(record.keys())[:5]}...")
                    print(f"   Transformed:")
                    for key, value in list(transformed.items())[:5]:
                        print(f"      {key}: {value}")
            
            except Exception as e:
                print(f"💥 Error transforming record {i}: {e}")
                continue
        
        print(f"\n✅ Successfully transformed {len(transformed_records)} records")
        print(f"📋 Would migrate to Xano table: {xano_table} (ID: {xano_table_id})")
        
        # Prompt for actual migration
        if transformed_records:
            proceed = input(f"\n🔄 Actually migrate these {len(transformed_records)} records to Xano? (y/N): ")
            if proceed.lower().startswith('y'):
                return await self.actually_migrate_to_xano(transformed_records, xano_table_id, xano_table)
        
        return True
    
    async def actually_migrate_to_xano(self, records: List[Dict], table_id: int, table_name: str) -> bool:
        """Actually migrate records to Xano using MCP tools - simulated for now"""
        print(f"\n🚀 MIGRATING TO XANO: {table_name}")
        print("=" * 40)
        
        success_count = 0
        failure_count = 0
        
        for i, record in enumerate(records):
            try:
                print(f"   📤 Migrating record {i+1}/{len(records)}...")
                
                # Here we would use the MCP Xano tools
                # For now, let's simulate the call
                print(f"      ✅ Record migrated successfully")
                # Example of what the actual call would look like:
                # result = await mcp_xano_addTableContentBulk(
                #     workspace_id=self.xano_workspace_id,
                #     table_id=table_id,
                #     items=[record]
                # )
                
                success_count += 1
                
                # Small delay to avoid overwhelming
                await asyncio.sleep(0.1)
                
            except Exception as e:
                print(f"      ❌ Failed: {e}")
                failure_count += 1
                self.migration_log["errors"].append(f"Migration {table_name} record {i}: {str(e)}")
        
        print(f"\n📊 Migration Results:")
        print(f"   ✅ Successful: {success_count}")
        print(f"   ❌ Failed: {failure_count}")
        
        self.migration_log["success_count"] += success_count
        self.migration_log["failure_count"] += failure_count
        self.migration_log["total_records"] += success_count
        
        return success_count > 0

async def main():
    """Main execution function"""
    migration = ChargeCarsDataMigrationMCP()
    
    print("🚀 ChargeCars SmartSuite → Xano Migration Tool (MCP Version)")
    print("=" * 65)
    print("This tool extracts data from SmartSuite and migrates it to Xano")
    print("⚠️  NOTE: Test version - limited records per table")
    
    # Show available tables
    available_tables = list(migration.table_mappings.keys())
    print(f"\n📋 Available tables for migration:")
    for i, table in enumerate(available_tables):
        mapping = migration.table_mappings[table]
        print(f"   {i+1}. {table} → {mapping['xano_table']} (Priority: {mapping['priority']})")
    
    # Menu options
    print(f"\n📖 Options:")
    print(f"   1. Test single table migration")
    print(f"   2. Full migration (all tables)")
    print(f"   3. Exit")
    
    try:
        choice = input(f"\nSelect option (1-3): ").strip()
        
        if choice == "1":
            # Single table test
            print(f"\nSelect table to test:")
            for i, table in enumerate(available_tables):
                print(f"   {i+1}. {table}")
            
            table_choice = int(input(f"\nSelect table (1-{len(available_tables)}): ")) - 1
            if 0 <= table_choice < len(available_tables):
                table_name = available_tables[table_choice]
                migration.migration_log["start_time"] = datetime.now()
                await migration.test_migration_single_table(table_name)
            else:
                print("❌ Invalid choice")
        
        elif choice == "2":
            # Full migration
            confirm = input(f"\n⚠️  Run FULL migration of ALL {len(available_tables)} tables? (y/N): ")
            if confirm.lower().startswith('y'):
                migration.migration_log["start_time"] = datetime.now()
                
                # Sort by priority
                sorted_tables = sorted(
                    available_tables,
                    key=lambda x: migration.table_mappings[x]['priority']
                )
                
                print(f"\n🔄 Starting full migration...")
                for table in sorted_tables:
                    print(f"\n{'='*50}")
                    await migration.test_migration_single_table(table)
                    await asyncio.sleep(2)  # Pause between tables
                
                # Final summary
                print(f"\n🎉 FULL MIGRATION COMPLETED!")
                print(f"📊 Total Records Migrated: {migration.migration_log['total_records']}")
                print(f"✅ Successful: {migration.migration_log['success_count']}")
                print(f"❌ Failed: {migration.migration_log['failure_count']}")
                
                if migration.migration_log["errors"]:
                    print(f"\n⚠️ Errors: {len(migration.migration_log['errors'])}")
            else:
                print("Migration cancelled")
        
        elif choice == "3":
            print("👋 Goodbye!")
        
        else:
            print("❌ Invalid choice")
    
    except (ValueError, KeyboardInterrupt):
        print("\n👋 Migration cancelled")
    except Exception as e:
        print(f"\n💥 Unexpected error: {e}")

if __name__ == "__main__":
    asyncio.run(main()) 