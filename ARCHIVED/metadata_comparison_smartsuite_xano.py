#!/usr/bin/env python3
"""
ChargeCars Metadata Comparison: SmartSuite vs Xano
Comprehensive analysis of data structures to identify missing entities
"""

import json
import asyncio
import aiohttp
from typing import Dict, List, Set, Any
from datetime import datetime

class MetadataComparison:
    def __init__(self):
        # SmartSuite Configuration
        self.smartsuite_api_key = "d99cf9b32aeaa64bdebb86e05da1d50e951246d6"
        self.smartsuite_workspace_id = "suhw2iz6"
        self.smartsuite_headers = {
            "Authorization": f"Token {self.smartsuite_api_key}",
            "Account-Id": self.smartsuite_workspace_id,
            "Content-Type": "application/json"
        }
        
        # Known Xano tables from MCP response
        self.xano_tables = {
            "article_components": {"id": 41, "description": "Package contents and component relationships"},
            "articles": {"id": 38, "description": "Products, services, and packages"},
            "contacts": {"id": 36, "description": "Contacts belonging to organizations with hierarchical access control"},
            "form_analytics": {"id": 56, "description": "Form performance and user behavior tracking"},
            "form_field_templates": {"id": 55, "description": "Reusable field templates for form builder"},
            "form_submissions": {"id": 43, "description": "Customer form submissions with custom field data"},
            "installation_performance": {"id": 53, "description": "AI/ML data for installation time predictions and learning"},
            "installation_teams": {"id": 51, "description": "Installation teams with skills and availability tracking"},
            "intake_forms": {"id": 42, "description": "Configurable intake forms with custom fields"},
            "line_items": {"id": 40, "description": "Individual line items for quotes and orders with flexible billing"},
            "order_status_history": {"id": 52, "description": "Order status transitions with timestamps for KPI tracking"},
            "orders": {"id": 37, "description": "Customer orders and projects (dossiers)"},
            "organizations": {"id": 35, "description": "HubSpot-style organizations for customers, partners, and internal entities"},
            "partner_commissions": {"id": 54, "description": "Partner commission tracking and payments"},
            "quotes": {"id": 39, "description": "Quotes and offers for orders"},
            "service_regions": {"id": 50, "description": "Geographic service regions for team dispatch optimization"},
            "sign_off_line_items": {"id": 48, "description": "Junction table linking sign-offs to multiple line items"},
            "sign_offs": {"id": 47, "description": "Digital signatures and approvals for orders"},
            "submission_files": {"id": 45, "description": "Files uploaded through intake forms with categorization"},
            "submission_line_items": {"id": 44, "description": "Line items from intake forms for order conversion"},
            "team_vehicle_assignments": {"id": 59, "description": "Dynamic assignment of teams to vehicles with history tracking"},
            "user_accounts": {"id": 49, "description": "User authentication accounts linked to contacts"},
            "vehicle_tracking": {"id": 58, "description": "Real-time GPS tracking data from vehicle blackboxes"},
            "vehicles": {"id": 57, "description": "Fleet vehicles with equipment and tracking capabilities"},
            "visits": {"id": 46, "description": "Installation and service visits"},
            "work_orders": {"id": 60, "description": "Unified work orders with LMRA assessment as integrated phase"}
        }
        
        # Business logic mapping (SmartSuite → Xano equivalent)
        self.known_mappings = {
            # Core Business Entities
            "Eindklanten": "organizations (customer_individual)",
            "Partners": "organizations (partner_automotive)", 
            "Organisaties": "organizations (various types)",
            "Medewerkers": "contacts (employee)",
            "Members": "contacts (team_member)",
            
            # Products & Inventory
            "Producten": "articles",
            "Artikelen": "articles", 
            "Line items": "line_items",
            "Configuration line items": "line_items (configured)",
            "Voorraden": "articles (inventory tracking)",
            
            # Orders & Projects
            "Orders": "orders",
            "Offertes": "quotes",
            "Bestellingen": "orders (supplier)",
            "CC projecten": "orders (project type)",
            
            # Operations & Installation
            "Bezoeken": "visits",
            "Werkbonnen": "work_orders",
            "Teams": "installation_teams",
            "Dag teams": "installation_teams",
            "Bussen": "vehicles",
            "Auto's": "vehicles",
            
            # Forms & Intake
            "Intake formulieren": "intake_forms",
            "Intake media": "submission_files",
            
            # Approvals & Signatures
            "Machtigingen": "sign_offs",
            "Akkoorden": "sign_offs",
            
            # Financial
            "Facturen": "Not implemented yet",
            "Betalingen": "Not implemented yet", 
            "Stripe uitbetalingen": "partner_commissions",
            
            # Geographic & Regions
            "Postcodegebieden": "service_regions",
            
            # System & Admin
            "Users": "user_accounts",
            "API clients": "Not implemented - API management",
            "Tokens": "Not implemented - API management"
        }

    async def extract_smartsuite_tables(self) -> List[Dict]:
        """Extract all table metadata from SmartSuite"""
        print("📥 Extracting SmartSuite table metadata...")
        
        async with aiohttp.ClientSession() as session:
            try:
                async with session.get(
                    "https://app.smartsuite.com/api/v1/applications",
                    headers=self.smartsuite_headers
                ) as response:
                    if response.status != 200:
                        raise Exception(f"Failed to get SmartSuite tables: {response.status}")
                    
                    tables = await response.json()
                    print(f"✅ Found {len(tables)} SmartSuite tables")
                    return tables
                    
            except Exception as e:
                print(f"💥 Error extracting SmartSuite metadata: {e}")
                return []

    async def get_table_fields(self, table_id: str, table_name: str) -> Dict:
        """Get field metadata for a specific SmartSuite table"""
        async with aiohttp.ClientSession() as session:
            try:
                await asyncio.sleep(0.2)  # Rate limiting
                
                async with session.get(
                    f"https://app.smartsuite.com/api/v1/applications/{table_id}",
                    headers=self.smartsuite_headers
                ) as response:
                    if response.status == 200:
                        table_data = await response.json()
                        fields = table_data.get('structure', {}).get('fields', [])
                        return {
                            'name': table_name,
                            'id': table_id,
                            'field_count': len(fields),
                            'fields': [field.get('label', 'Unknown') for field in fields[:10]]  # First 10 fields
                        }
                    else:
                        return {'name': table_name, 'id': table_id, 'error': f"HTTP {response.status}"}
                        
            except Exception as e:
                return {'name': table_name, 'id': table_id, 'error': str(e)}

    def categorize_smartsuite_tables(self, tables: List[Dict]) -> Dict[str, List[str]]:
        """Categorize SmartSuite tables by business function"""
        categories = {
            "Core Business": [],
            "Orders & Projects": [],
            "Operations": [],
            "Forms & Intake": [],
            "Financial": [],
            "System & Admin": [],
            "Archive/Concept": [],
            "Unmapped": []
        }
        
        for table in tables:
            name = table.get('name', '')
            
            if any(keyword in name.lower() for keyword in ['eindklanten', 'partners', 'organisaties', 'medewerkers', 'members']):
                categories["Core Business"].append(name)
            elif any(keyword in name.lower() for keyword in ['orders', 'offertes', 'bestellingen', 'projecten']):
                categories["Orders & Projects"].append(name)
            elif any(keyword in name.lower() for keyword in ['bezoeken', 'werkbonnen', 'teams', 'bussen', 'auto']):
                categories["Operations"].append(name)
            elif any(keyword in name.lower() for keyword in ['intake', 'formulieren', 'media']):
                categories["Forms & Intake"].append(name)
            elif any(keyword in name.lower() for keyword in ['facturen', 'betalingen', 'stripe']):
                categories["Financial"].append(name)
            elif any(keyword in name.lower() for keyword in ['users', 'api', 'tokens', 'system']):
                categories["System & Admin"].append(name)
            elif any(keyword in name.lower() for keyword in ['archief', 'concept', 'oud', '2022', '2023']):
                categories["Archive/Concept"].append(name)
            else:
                categories["Unmapped"].append(name)
                
        return categories

    def analyze_coverage(self, smartsuite_tables: List[Dict]) -> Dict:
        """Analyze what's covered in Xano vs SmartSuite"""
        analysis = {
            "xano_tables_count": len(self.xano_tables),
            "smartsuite_tables_count": len(smartsuite_tables),
            "mapped_tables": [],
            "missing_in_xano": [],
            "xano_only": [],
            "mapping_coverage": 0
        }
        
        smartsuite_names = {table['name'] for table in smartsuite_tables}
        mapped_smartsuite = set(self.known_mappings.keys())
        
        # Find what's mapped
        for ss_name, xano_equiv in self.known_mappings.items():
            if ss_name in smartsuite_names:
                analysis["mapped_tables"].append({
                    "smartsuite": ss_name,
                    "xano": xano_equiv,
                    "implemented": "Not implemented" not in xano_equiv
                })
        
        # Find missing in Xano
        active_smartsuite = [name for name in smartsuite_names 
                           if not any(keyword in name.lower() for keyword in ['archief', 'concept', 'oud', '2022', '2023'])]
        
        for name in active_smartsuite:
            if name not in mapped_smartsuite:
                analysis["missing_in_xano"].append(name)
        
        # Calculate coverage
        total_active = len(active_smartsuite)
        mapped_active = len([name for name in mapped_smartsuite if name in active_smartsuite])
        analysis["mapping_coverage"] = (mapped_active / total_active * 100) if total_active > 0 else 0
        
        return analysis

    def generate_migration_priorities(self, analysis: Dict, categories: Dict) -> List[Dict]:
        """Generate prioritized list of tables to migrate"""
        priorities = []
        
        # High Priority: Core business data
        for table in analysis["missing_in_xano"]:
            if table in categories["Core Business"]:
                priorities.append({
                    "table": table,
                    "priority": "HIGH",
                    "reason": "Core business entity",
                    "suggested_xano_table": "organizations or contacts"
                })
        
        # Medium Priority: Operational data
        for table in analysis["missing_in_xano"]:
            if table in categories["Operations"]:
                priorities.append({
                    "table": table,
                    "priority": "MEDIUM",
                    "reason": "Operational functionality",
                    "suggested_xano_table": "New table needed"
                })
        
        # Low Priority: Everything else
        for table in analysis["missing_in_xano"]:
            if table not in categories["Core Business"] and table not in categories["Operations"]:
                if table not in categories["Archive/Concept"]:
                    priorities.append({
                        "table": table,
                        "priority": "LOW",
                        "reason": "Supporting functionality",
                        "suggested_xano_table": "To be determined"
                    })
        
        return priorities

    async def run_comparison(self):
        """Run the complete metadata comparison"""
        print("🔍 ChargeCars Metadata Comparison: SmartSuite vs Xano")
        print("=" * 60)
        
        # Extract SmartSuite metadata
        smartsuite_tables = await self.extract_smartsuite_tables()
        if not smartsuite_tables:
            return
        
        # Categorize tables
        categories = self.categorize_smartsuite_tables(smartsuite_tables)
        
        # Analyze coverage
        analysis = self.analyze_coverage(smartsuite_tables)
        
        # Generate priorities
        priorities = self.generate_migration_priorities(analysis, categories)
        
        # Print comprehensive report
        print(f"\n📊 OVERVIEW")
        print(f"SmartSuite Tables: {analysis['smartsuite_tables_count']}")
        print(f"Xano Tables: {analysis['xano_tables_count']}")
        print(f"Mapping Coverage: {analysis['mapping_coverage']:.1f}%")
        
        print(f"\n📋 SMARTSUITE CATEGORIES")
        for category, tables in categories.items():
            if tables:
                print(f"  {category}: {len(tables)} tables")
                for table in tables[:3]:  # Show first 3
                    print(f"    - {table}")
                if len(tables) > 3:
                    print(f"    ... and {len(tables) - 3} more")
        
        print(f"\n✅ SUCCESSFULLY MAPPED ({len(analysis['mapped_tables'])} tables)")
        for mapping in analysis['mapped_tables']:
            status = "✅ Implemented" if mapping['implemented'] else "❌ Not implemented"
            print(f"  {mapping['smartsuite']} → {mapping['xano']} {status}")
        
        print(f"\n❌ MISSING IN XANO ({len(analysis['missing_in_xano'])} tables)")
        for table in analysis['missing_in_xano'][:10]:  # Show first 10
            print(f"  - {table}")
        if len(analysis['missing_in_xano']) > 10:
            print(f"  ... and {len(analysis['missing_in_xano']) - 10} more")
        
        print(f"\n🎯 MIGRATION PRIORITIES")
        high_priority = [p for p in priorities if p['priority'] == 'HIGH']
        medium_priority = [p for p in priorities if p['priority'] == 'MEDIUM']
        
        if high_priority:
            print(f"  HIGH PRIORITY ({len(high_priority)} tables):")
            for p in high_priority:
                print(f"    🔥 {p['table']} → {p['suggested_xano_table']}")
        
        if medium_priority:
            print(f"  MEDIUM PRIORITY ({len(medium_priority)} tables):")
            for p in medium_priority[:5]:
                print(f"    ⚡ {p['table']} → {p['suggested_xano_table']}")
            if len(medium_priority) > 5:
                print(f"    ... and {len(medium_priority) - 5} more")
        
        # Save detailed report
        report = {
            "generated_at": datetime.now().isoformat(),
            "overview": analysis,
            "categories": categories,
            "priorities": priorities,
            "xano_tables": self.xano_tables,
            "smartsuite_tables": [t['name'] for t in smartsuite_tables]
        }
        
        with open('metadata_comparison_report.json', 'w', encoding='utf-8') as f:
            json.dump(report, f, indent=2, ensure_ascii=False)
        
        print(f"\n💾 Detailed report saved to: metadata_comparison_report.json")
        
        return report

async def main():
    """Main entry point"""
    comparison = MetadataComparison()
    await comparison.run_comparison()

if __name__ == "__main__":
    asyncio.run(main()) 