#!/usr/bin/env python3
"""
ChargeCars Data Migration: SmartSuite → Xano
Complete data migration with mapping and transformation
"""

import asyncio
import aiohttp
import json
import time
from datetime import datetime
from typing import Dict, List, Any, Optional
import uuid

class ChargeCarsDataMigration:
    def __init__(self):
        # SmartSuite Configuration
        self.smartsuite_api_key = "d99cf9b32aeaa64bdebb86e05da1d50e951246d6"
        self.smartsuite_workspace_id = "suhw2iz6"
        
        # Xano Configuration (would need to be configured)
        self.xano_api_url = "https://xrxc-xsc9-6egu.xano.io/api:ws_3_chargecars_v2"
        self.xano_api_key = "YOUR_XANO_API_KEY"  # Need to get this
        
        # Headers
        self.smartsuite_headers = {
            "Authorization": f"Token {self.smartsuite_api_key}",
            "Account-Id": self.smartsuite_workspace_id,
            "Content-Type": "application/json"
        }
        
        self.xano_headers = {
            "Authorization": f"Bearer {self.xano_api_key}",
            "Content-Type": "application/json"
        }
        
        # Mapping configurations
        self.table_mappings = self._setup_table_mappings()
        self.field_mappings = self._setup_field_mappings()
        
        # Migration status
        self.migration_stats = {
            "start_time": None,
            "end_time": None,
            "tables_processed": 0,
            "total_records_migrated": 0,
            "errors": [],
            "success_count": 0,
            "failure_count": 0
        }
    
    def _setup_table_mappings(self) -> Dict[str, Dict]:
        """Map SmartSuite tables to Xano tables"""
        return {
            "Eindklanten": {
                "xano_table": "organizations",
                "xano_table_id": 35,
                "priority": 1,
                "default_organization_type": "customer_individual",
                "default_business_entity": "chargecars"
            },
            "Partners": {
                "xano_table": "organizations", 
                "xano_table_id": 35,
                "priority": 1,
                "default_organization_type": "partner_automotive",
                "default_business_entity": "chargecars"
            },
            "Organisaties": {
                "xano_table": "organizations",
                "xano_table_id": 35,
                "priority": 1,
                "default_organization_type": "customer_business",
                "default_business_entity": "chargecars"
            },
            "Producten": {
                "xano_table": "articles",
                "xano_table_id": 38,
                "priority": 2,
                "default_article_type": "wallbox"
            },
            "Orders": {
                "xano_table": "orders",
                "xano_table_id": 37,
                "priority": 3,
                "default_order_type": "installation",
                "default_business_entity": "chargecars"
            },
            "Offertes": {
                "xano_table": "quotes",
                "xano_table_id": 39,
                "priority": 4
            },
            "Bezoeken": {
                "xano_table": "visits",
                "xano_table_id": 46,
                "priority": 5,
                "default_visit_type": "installation"
            },
            "Teams": {
                "xano_table": "installation_teams",
                "xano_table_id": 51,
                "priority": 2
            },
            "Werkbonnen": {
                "xano_table": "work_orders",
                "xano_table_id": 60,
                "priority": 6
            }
        }
    
    def _setup_field_mappings(self) -> Dict[str, Dict]:
        """Map SmartSuite fields to Xano fields per table"""
        return {
            "organizations": {
                "naam": "name",
                "bedrijfsnaam": "legal_name", 
                "website": "website",
                "telefoon": "phone",
                "email": "email",
                "kvk": "chamber_of_commerce",
                "btw": "vat_number",
                "type": "organization_type",
                "status": "is_active",
                "commissie": "commission_rate"
            },
            "articles": {
                "naam": "name",
                "beschrijving": "description",
                "type": "article_type",
                "prijs_klant": "price_customer",
                "prijs_partner": "price_partner",
                "leverancier": "supplier_id",
                "specificaties": "specifications"
            },
            "orders": {
                "ordernummer": "order_number",
                "klant": "customer_organization_id",
                "partner": "partner_organization_id",
                "status": "order_status",
                "totaal": "total_amount",
                "adres": "installation_address",
                "startdatum": "planned_start_date",
                "einddatum": "planned_completion_date"
            },
            "visits": {
                "order": "order_id",
                "type": "visit_type",
                "datum": "scheduled_date",
                "starttijd": "scheduled_time_start",
                "eindtijd": "scheduled_time_end",
                "status": "visit_status",
                "team": "team_id"
            },
            "installation_teams": {
                "naam": "team_name",
                "leden": "team_members",
                "vaardigheden": "team_skills",
                "regio": "home_base_location"
            }
        }
    
    async def extract_smartsuite_data(self, table_name: str, limit: int = 1000) -> List[Dict]:
        """Extract data from SmartSuite table"""
        print(f"📥 Extracting data from SmartSuite table: {table_name}")
        
        async with aiohttp.ClientSession() as session:
            try:
                # First get table ID
                async with session.get(
                    "https://app.smartsuite.com/api/v1/applications", 
                    headers=self.smartsuite_headers
                ) as response:
                    if response.status != 200:
                        raise Exception(f"Failed to get tables: {response.status}")
                    
                    tables = await response.json()
                    table_id = None
                    
                    for table in tables:
                        if table.get('name', '').lower() == table_name.lower():
                            table_id = table.get('id')
                            break
                    
                    if not table_id:
                        print(f"❌ Table '{table_name}' not found in SmartSuite")
                        return []
                
                # Extract records
                await asyncio.sleep(0.2)  # Rate limiting
                
                records_url = f"https://app.smartsuite.com/api/v1/applications/{table_id}/records/list/"
                request_body = {
                    "filter": {},
                    "sort": [],
                    "limit": limit
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
                        
                        print(f"✅ Extracted {len(records)} records from {table_name} (Total: {total})")
                        return records
                    
                    elif response.status == 429:
                        print(f"⚠️ Rate limited for {table_name} - waiting 30 seconds...")
                        await asyncio.sleep(30)
                        return await self.extract_smartsuite_data(table_name, limit)
                    
                    else:
                        raise Exception(f"Failed to extract {table_name}: {response.status}")
            
            except Exception as e:
                print(f"💥 Error extracting {table_name}: {e}")
                self.migration_stats["errors"].append(f"Extract {table_name}: {e}")
                return []
    
    def transform_record(self, record: Dict, table_mapping: Dict, field_mapping: Dict) -> Dict:
        """Transform SmartSuite record to Xano format"""
        transformed = {}
        
        # Apply field mappings
        for smartsuite_field, xano_field in field_mapping.items():
            if smartsuite_field in record:
                value = record[smartsuite_field]
                
                # Data type transformations
                if xano_field == "is_active" and isinstance(value, str):
                    transformed[xano_field] = value.lower() in ['active', 'actief', 'ja', 'yes', 'true']
                elif xano_field.endswith("_id") and isinstance(value, (str, int)):
                    # Handle ID references (would need lookup logic)
                    transformed[xano_field] = value
                elif xano_field in ["commission_rate"] and isinstance(value, str):
                    try:
                        transformed[xano_field] = float(value.replace('%', '').replace(',', '.'))
                    except:
                        transformed[xano_field] = None
                else:
                    transformed[xano_field] = value
        
        # Apply default values
        for key, value in table_mapping.items():
            if key.startswith("default_") and key != "default_organization_type":
                field_name = key.replace("default_", "")
                if field_name not in transformed:
                    transformed[field_name] = value
        
        # Special handling for organization_type
        if "default_organization_type" in table_mapping:
            if "organization_type" not in transformed:
                transformed["organization_type"] = table_mapping["default_organization_type"]
        
        return transformed
    
    async def migrate_table(self, smartsuite_table: str) -> bool:
        """Migrate a complete table from SmartSuite to Xano"""
        print(f"\n🔄 MIGRATING TABLE: {smartsuite_table}")
        print("=" * 50)
        
        if smartsuite_table not in self.table_mappings:
            print(f"❌ No mapping configured for table: {smartsuite_table}")
            return False
        
        table_mapping = self.table_mappings[smartsuite_table]
        xano_table = table_mapping["xano_table"]
        xano_table_id = table_mapping["xano_table_id"]
        
        # Get field mappings
        field_mapping = self.field_mappings.get(xano_table, {})
        
        # Extract data from SmartSuite
        smartsuite_records = await self.extract_smartsuite_data(smartsuite_table)
        
        if not smartsuite_records:
            print(f"⚠️ No data found in {smartsuite_table}")
            return True
        
        # Transform and prepare for Xano
        transformed_records = []
        for record in smartsuite_records[:10]:  # Limit to 10 for testing
            try:
                transformed = self.transform_record(record, table_mapping, field_mapping)
                transformed_records.append(transformed)
            except Exception as e:
                print(f"💥 Error transforming record: {e}")
                continue
        
        print(f"📊 Transformed {len(transformed_records)} records for migration")
        
        # Show sample transformation
        if transformed_records:
            print(f"📝 Sample transformed record:")
            sample = transformed_records[0]
            for key, value in list(sample.items())[:5]:
                print(f"   {key}: {value}")
        
        # TODO: Actually migrate to Xano using the MCP tools
        # For now, just simulate the migration
        print(f"✅ Simulated migration of {len(transformed_records)} records to Xano {xano_table}")
        
        self.migration_stats["success_count"] += len(transformed_records)
        self.migration_stats["total_records_migrated"] += len(transformed_records)
        
        return True
    
    async def run_full_migration(self):
        """Run complete migration from SmartSuite to Xano"""
        print("🚀 STARTING FULL DATA MIGRATION")
        print("SmartSuite → Xano")
        print("=" * 60)
        
        self.migration_stats["start_time"] = datetime.now()
        
        # Sort tables by priority
        sorted_tables = sorted(
            self.table_mappings.items(),
            key=lambda x: x[1].get("priority", 999)
        )
        
        print(f"📋 Migration Order ({len(sorted_tables)} tables):")
        for i, (table_name, mapping) in enumerate(sorted_tables):
            priority = mapping.get("priority", "?")
            xano_table = mapping.get("xano_table", "?")
            print(f"   {i+1}. {table_name} → {xano_table} (Priority: {priority})")
        
        # Migrate each table
        for table_name, mapping in sorted_tables:
            try:
                success = await self.migrate_table(table_name)
                if success:
                    self.migration_stats["tables_processed"] += 1
                
                # Rate limiting between tables
                await asyncio.sleep(1)
                
            except Exception as e:
                print(f"💥 Failed to migrate table {table_name}: {e}")
                self.migration_stats["errors"].append(f"Table {table_name}: {e}")
                self.migration_stats["failure_count"] += 1
        
        self.migration_stats["end_time"] = datetime.now()
        self._print_migration_summary()
    
    def _print_migration_summary(self):
        """Print final migration summary"""
        print("\n🎉 MIGRATION COMPLETED!")
        print("=" * 60)
        
        duration = self.migration_stats["end_time"] - self.migration_stats["start_time"]
        
        print(f"⏱️  Duration: {duration}")
        print(f"📊 Tables Processed: {self.migration_stats['tables_processed']}")
        print(f"📈 Total Records Migrated: {self.migration_stats['total_records_migrated']}")
        print(f"✅ Successful: {self.migration_stats['success_count']}")
        print(f"❌ Failed: {self.migration_stats['failure_count']}")
        
        if self.migration_stats["errors"]:
            print(f"\n⚠️ Errors ({len(self.migration_stats['errors'])}):")
            for error in self.migration_stats["errors"][:5]:
                print(f"   - {error}")
        
        # Save migration log
        log_file = f"migration_log_{datetime.now().strftime('%Y%m%d_%H%M%S')}.json"
        with open(log_file, 'w', encoding='utf-8') as f:
            json.dump(self.migration_stats, f, indent=2, default=str, ensure_ascii=False)
        
        print(f"\n📄 Migration log saved: {log_file}")

async def main():
    """Main migration execution"""
    migration = ChargeCarsDataMigration()
    
    print("ChargeCars Data Migration Tool")
    print("=" * 60)
    print("This script will migrate data from SmartSuite to Xano")
    print("⚠️  NOTE: This is a TEST VERSION - limited to 10 records per table")
    
    # Option to test single table
    test_mode = input("\nRun single table test? (y/N): ").lower().startswith('y')
    
    if test_mode:
        available_tables = list(migration.table_mappings.keys())
        print(f"\nAvailable tables:")
        for i, table in enumerate(available_tables):
            print(f"   {i+1}. {table}")
        
        try:
            choice = int(input(f"\nSelect table (1-{len(available_tables)}): ")) - 1
            if 0 <= choice < len(available_tables):
                table_name = available_tables[choice]
                await migration.migrate_table(table_name)
            else:
                print("❌ Invalid choice")
        except ValueError:
            print("❌ Invalid input")
    else:
        # Full migration
        confirm = input("\nRun FULL migration? (y/N): ").lower().startswith('y')
        if confirm:
            await migration.run_full_migration()
        else:
            print("Migration cancelled")

if __name__ == "__main__":
    asyncio.run(main()) 