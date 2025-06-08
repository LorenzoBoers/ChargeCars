#!/usr/bin/env python3
"""
Smartsuite Relationship Analysis for ChargeCars
Analyze table relationships and create a comprehensive mapping
"""

import json
from collections import defaultdict

def analyze_smartsuite_relationships():
    """Analyze the extracted metadata to understand table relationships"""
    
    print("🔗 SMARTSUITE RELATIONSHIP ANALYSIS")
    print("=" * 60)
    
    # Load the metadata
    try:
        with open('smartsuite_metadata_complete.json', 'r', encoding='utf-8') as f:
            metadata = json.load(f)
    except FileNotFoundError:
        print("❌ Metadata file not found. Run metadata extraction first.")
        return
    
    print(f"📊 Analysis of metadata extracted on: {metadata['extraction_timestamp']}")
    
    # Create application ID to name mapping
    app_id_to_name = {}
    for app in metadata['applications']:
        app_id_to_name[app.get('id')] = app.get('name')
    
    print(f"\n📈 METADATA OVERVIEW:")
    print(f"   - Solutions: {metadata['summary']['total_solutions']}")
    print(f"   - Applications: {metadata['summary']['total_applications']}")
    print(f"   - Relationship Fields: {metadata['summary']['total_relationship_fields']}")
    
    # Analyze Solutions structure
    print(f"\n🏗️  SOLUTIONS STRUCTURE:")
    for solution in metadata['solutions']:
        solution_name = solution.get('name', 'Unknown')
        solution_id = solution.get('id', 'Unknown')
        print(f"   📁 {solution_name}")
        
        # Find applications in this solution
        solution_apps = [app for app in metadata['applications'] 
                        if app.get('solution') == solution_id]
        
        if solution_apps:
            print(f"      Applications ({len(solution_apps)}):")
            for app in solution_apps[:5]:  # Show first 5
                print(f"         - {app.get('name', 'Unknown')}")
            if len(solution_apps) > 5:
                print(f"         ... and {len(solution_apps) - 5} more")
    
    # Analyze key operational relationships
    print(f"\n🎯 KEY OPERATIONAL TABLE RELATIONSHIPS:")
    
    key_tables = ['Bezoeken', 'Orders', 'Eindklanten', 'Werkbonnen', 'Offertes', 'Organisaties', 'Leads']
    
    relationship_map = {}
    
    for table_name in key_tables:
        if table_name in metadata['field_relationships']:
            table_data = metadata['field_relationships'][table_name]
            relationships = table_data.get('relationship_fields', [])
            
            print(f"\n   📋 {table_name} ({table_data['total_fields']} fields total):")
            print(f"      🔗 {len(relationships)} relationship fields:")
            
            relationship_map[table_name] = []
            
            for rel in relationships:
                field_label = rel.get('field_label', 'Unknown')
                field_type = rel.get('field_type', 'Unknown')
                params = rel.get('params', {})
                
                # Try to find target table
                target_app_id = (params.get('foreign_table_id') or 
                               params.get('application_id') or 
                               params.get('target_application_id'))
                
                target_table = app_id_to_name.get(target_app_id, 'Unknown') if target_app_id else 'Unknown'
                
                relationship_map[table_name].append({
                    'field': field_label,
                    'type': field_type,
                    'target': target_table,
                    'target_id': target_app_id
                })
                
                if target_table != 'Unknown':
                    print(f"         → {field_label} → {target_table} ({field_type})")
                else:
                    print(f"         → {field_label} (internal {field_type})")
    
    # Create relationship matrix
    print(f"\n🗺️  RELATIONSHIP MATRIX:")
    print(f"   Source Table → Target Tables")
    
    for source_table, relationships in relationship_map.items():
        if relationships:
            targets = [rel['target'] for rel in relationships if rel['target'] != 'Unknown']
            unique_targets = list(set(targets))
            
            if unique_targets:
                print(f"   📋 {source_table}:")
                for target in unique_targets:
                    count = targets.count(target)
                    print(f"      → {target} ({count} connection{'s' if count > 1 else ''})")
    
    # Analyze core business flow
    print(f"\n💼 CORE BUSINESS FLOW ANALYSIS:")
    
    # Lead to Customer flow
    if 'Leads' in relationship_map:
        lead_targets = [rel['target'] for rel in relationship_map['Leads'] if rel['target'] != 'Unknown']
        print(f"   🎯 Leads connect to: {', '.join(set(lead_targets))}")
    
    # Customer to Order flow
    if 'Eindklanten' in relationship_map:
        customer_targets = [rel['target'] for rel in relationship_map['Eindklanten'] if rel['target'] != 'Unknown']
        print(f"   👥 Customers connect to: {', '.join(set(customer_targets))}")
    
    # Order to Visit flow
    if 'Orders' in relationship_map:
        order_targets = [rel['target'] for rel in relationship_map['Orders'] if rel['target'] != 'Unknown']
        print(f"   📦 Orders connect to: {', '.join(set(order_targets))}")
    
    # Visit to Work Order flow
    if 'Bezoeken' in relationship_map:
        visit_targets = [rel['target'] for rel in relationship_map['Bezoeken'] if rel['target'] != 'Unknown']
        print(f"   🏠 Visits connect to: {', '.join(set(visit_targets))}")
    
    # Work Order connections
    if 'Werkbonnen' in relationship_map:
        workorder_targets = [rel['target'] for rel in relationship_map['Werkbonnen'] if rel['target'] != 'Unknown']
        print(f"   🔧 Work Orders connect to: {', '.join(set(workorder_targets))}")
    
    # Analyze field types
    print(f"\n📊 RELATIONSHIP FIELD TYPES ANALYSIS:")
    
    field_type_counts = defaultdict(int)
    for table_name, table_data in metadata['field_relationships'].items():
        for rel in table_data.get('relationship_fields', []):
            field_type_counts[rel.get('field_type', 'Unknown')] += 1
    
    for field_type, count in sorted(field_type_counts.items(), key=lambda x: x[1], reverse=True):
        print(f"   📋 {field_type}: {count} fields")
    
    # Generate Xano migration insights
    print(f"\n🚀 XANO MIGRATION INSIGHTS:")
    
    print(f"   🔗 Relationship Complexity:")
    for table_name in key_tables:
        if table_name in relationship_map:
            rel_count = len(relationship_map[table_name])
            complexity = "High" if rel_count > 10 else "Medium" if rel_count > 5 else "Low"
            print(f"      - {table_name}: {rel_count} relationships ({complexity} complexity)")
    
    print(f"\n   📋 Migration Priority Based on Relationships:")
    
    # Sort tables by relationship complexity (fewer relationships = easier to migrate first)
    migration_order = []
    for table_name in key_tables:
        if table_name in relationship_map:
            rel_count = len(relationship_map[table_name])
            migration_order.append((table_name, rel_count))
    
    migration_order.sort(key=lambda x: x[1])  # Sort by relationship count (ascending)
    
    for i, (table_name, rel_count) in enumerate(migration_order, 1):
        print(f"      {i}. {table_name} ({rel_count} relationships)")
    
    # Core operational workflow
    print(f"\n🔄 CORE OPERATIONAL WORKFLOW IDENTIFIED:")
    print(f"   1. Leads → (conversion) → Customers")
    print(f"   2. Customers → Orders → Quotes")
    print(f"   3. Orders → Visits (Bezoeken)")
    print(f"   4. Visits → Work Orders (Werkbonnen)")
    print(f"   5. Work Orders → Invoices/Completion")
    print(f"   6. Organizations (Partners) → Multiple touchpoints")
    
    # Save relationship analysis
    analysis_output = {
        "analysis_timestamp": metadata['extraction_timestamp'],
        "relationship_map": relationship_map,
        "field_type_counts": dict(field_type_counts),
        "migration_order": migration_order,
        "core_workflow": [
            "Leads → Customers",
            "Customers → Orders",
            "Orders → Visits",
            "Visits → Work Orders",
            "Organizations → Multiple touchpoints"
        ]
    }
    
    with open('smartsuite_relationship_analysis.json', 'w', encoding='utf-8') as f:
        json.dump(analysis_output, f, indent=2, ensure_ascii=False)
    
    print(f"\n✅ Relationship analysis complete!")
    print(f"💾 Analysis saved to: smartsuite_relationship_analysis.json")
    print(f"🎯 Key finding: {metadata['summary']['total_relationship_fields']} relationship fields across {len(key_tables)} core tables")
    print(f"💡 Next step: Use this relationship map for Xano database design")

if __name__ == "__main__":
    analyze_smartsuite_relationships() 