#!/usr/bin/env python3
"""
Smartsuite Data Analysis for ChargeCars Operations
Analyze the extracted operational data to understand current business processes
"""

import json
from datetime import datetime
from collections import defaultdict

def analyze_smartsuite_data():
    """Analyze the extracted Smartsuite operational data"""
    
    print("🔍 SMARTSUITE OPERATIONAL DATA ANALYSIS")
    print("=" * 60)
    
    # Load the extracted data
    try:
        with open('smartsuite_operational_complete.json', 'r', encoding='utf-8') as f:
            data = json.load(f)
    except FileNotFoundError:
        print("❌ Data file not found. Run extraction first.")
        return
    
    print(f"📊 Analysis of data extracted on: {data['extraction_timestamp']}")
    print(f"🏢 Workspace: {data['workspace_id']}")
    
    # Core operational metrics
    total_records = data['summary']['total_records']
    operational_tables = data['summary']['operational_tables']
    
    print(f"\n📈 CORE OPERATIONAL METRICS:")
    print(f"   - Total Records: {total_records:,}")
    print(f"   - Operational Tables: {operational_tables}")
    print(f"   - Extraction Success Rate: {data['summary']['extraction_rate']}")
    
    # Analyze key business tables
    print(f"\n🎯 KEY BUSINESS TABLES ANALYSIS:")
    
    key_tables = {
        'Bezoeken': 'Installation visits/appointments',
        'Orders': 'Customer orders',
        'Eindklanten': 'End customers',
        'Werkbonnen': 'Work orders (current)',
        'Werkbonnen 2022 - Juli 2023': 'Work orders (historical)',
        'Offertes': 'Quotes/proposals',
        'Leads': 'Sales leads',
        'Organisaties': 'Partner organizations',
        'Producten': 'Products catalog',
        'Laadstation registraties': 'Charging station registrations'
    }
    
    for table_name, description in key_tables.items():
        if table_name in data['records_by_table']:
            table_data = data['records_by_table'][table_name]
            record_count = table_data['record_count']
            total_count = table_data.get('total_count', record_count)
            
            print(f"   📋 {table_name}: {record_count:,} records ({description})")
            
            # Show field structure for key tables
            if 'structure' in table_data:
                field_count = len(table_data['structure'])
                print(f"      🏗️  Structure: {field_count} fields defined")
    
    # Calculate business volumes
    print(f"\n💼 BUSINESS VOLUME ANALYSIS:")
    
    # Customer base
    customers = data['records_by_table'].get('Eindklanten', {}).get('record_count', 0)
    print(f"   👥 Customer Base: {customers:,} end customers")
    
    # Order volume
    orders = data['records_by_table'].get('Orders', {}).get('record_count', 0)
    print(f"   📦 Order Volume: {orders:,} orders")
    
    # Installation visits
    visits = data['records_by_table'].get('Bezoeken', {}).get('record_count', 0)
    print(f"   🏠 Installation Visits: {visits:,} visits")
    
    # Work orders (current + historical)
    current_workorders = data['records_by_table'].get('Werkbonnen', {}).get('record_count', 0)
    historical_workorders = data['records_by_table'].get('Werkbonnen 2022 - Juli 2023', {}).get('record_count', 0)
    total_workorders = current_workorders + historical_workorders
    print(f"   🔧 Work Orders: {total_workorders:,} total ({current_workorders:,} current + {historical_workorders:,} historical)")
    
    # Quotes
    quotes = data['records_by_table'].get('Offertes', {}).get('record_count', 0)
    print(f"   💰 Quotes: {quotes:,} quotes/proposals")
    
    # Leads
    leads = data['records_by_table'].get('Leads', {}).get('record_count', 0)
    print(f"   🎯 Sales Leads: {leads:,} leads")
    
    # Partner organizations
    partners = data['records_by_table'].get('Organisaties', {}).get('record_count', 0)
    print(f"   🤝 Partner Organizations: {partners:,} organizations")
    
    # Product catalog
    products = data['records_by_table'].get('Producten', {}).get('record_count', 0)
    print(f"   📦 Product Catalog: {products:,} products")
    
    # Charging station registrations
    stations = data['records_by_table'].get('Laadstation registraties', {}).get('record_count', 0)
    print(f"   ⚡ Charging Stations: {stations:,} registered stations")
    
    # Team and operational data
    print(f"\n👥 TEAM & OPERATIONAL DATA:")
    
    teams = data['records_by_table'].get('Teams', {}).get('record_count', 0)
    print(f"   🚐 Teams: {teams:,} teams")
    
    members = data['records_by_table'].get('Members', {}).get('record_count', 0)
    print(f"   👷 Team Members: {members:,} members")
    
    day_teams = data['records_by_table'].get('Dag teams', {}).get('record_count', 0)
    print(f"   📅 Daily Team Assignments: {day_teams:,} assignments")
    
    # Agenda and scheduling
    agenda_current = data['records_by_table'].get('Agenda records', {}).get('record_count', 0)
    agenda_historical = data['records_by_table'].get('Agenda tot 2023', {}).get('record_count', 0)
    total_agenda = agenda_current + agenda_historical
    print(f"   📅 Agenda Items: {total_agenda:,} total ({agenda_current:,} current + {agenda_historical:,} historical)")
    
    # Calculate conversion rates
    print(f"\n📊 CONVERSION RATE ANALYSIS:")
    
    if leads > 0 and quotes > 0:
        lead_to_quote = (quotes / leads) * 100
        print(f"   🎯 Lead → Quote: {lead_to_quote:.1f}% ({quotes:,} quotes from {leads:,} leads)")
    
    if quotes > 0 and orders > 0:
        quote_to_order = (orders / quotes) * 100
        print(f"   💰 Quote → Order: {quote_to_order:.1f}% ({orders:,} orders from {quotes:,} quotes)")
    
    if orders > 0 and visits > 0:
        order_to_visit = (visits / orders) * 100
        print(f"   🏠 Order → Visit: {order_to_visit:.1f}% ({visits:,} visits from {orders:,} orders)")
    
    if visits > 0 and total_workorders > 0:
        visit_to_workorder = (total_workorders / visits) * 100
        print(f"   🔧 Visit → Work Order: {visit_to_workorder:.1f}% ({total_workorders:,} work orders from {visits:,} visits)")
    
    # Data quality assessment
    print(f"\n🔍 DATA QUALITY ASSESSMENT:")
    
    tables_with_data = 0
    empty_tables = []
    large_tables = []
    
    for table_name, table_data in data['records_by_table'].items():
        record_count = table_data['record_count']
        if record_count > 0:
            tables_with_data += 1
            if record_count > 1000:
                large_tables.append((table_name, record_count))
        else:
            empty_tables.append(table_name)
    
    print(f"   ✅ Tables with Data: {tables_with_data}/{operational_tables} ({(tables_with_data/operational_tables)*100:.1f}%)")
    print(f"   📊 Large Tables (>1000 records): {len(large_tables)}")
    
    if large_tables:
        print(f"      Large tables:")
        for table_name, count in sorted(large_tables, key=lambda x: x[1], reverse=True):
            print(f"         - {table_name}: {count:,} records")
    
    if empty_tables:
        print(f"   ⚠️  Empty Tables: {len(empty_tables)}")
        print(f"      Empty: {', '.join(empty_tables)}")
    
    # Migration priority assessment
    print(f"\n🚀 XANO MIGRATION PRIORITY ASSESSMENT:")
    
    migration_priority = [
        ('Bezoeken', visits, 'Core installation scheduling'),
        ('Orders', orders, 'Customer order management'),
        ('Eindklanten', customers, 'Customer database'),
        ('Werkbonnen', current_workorders, 'Current work orders'),
        ('Offertes', quotes, 'Quote management'),
        ('Organisaties', partners, 'Partner management'),
        ('Producten', products, 'Product catalog'),
        ('Leads', leads, 'Sales pipeline'),
        ('Laadstation registraties', stations, 'Asset tracking')
    ]
    
    print(f"   Priority order for Xano migration:")
    for i, (table_name, count, description) in enumerate(migration_priority, 1):
        if count > 0:
            print(f"      {i}. {table_name}: {count:,} records ({description})")
    
    # Generate summary for PRD update
    print(f"\n📋 PRD UPDATE SUMMARY:")
    print(f"   - Smartsuite contains {total_records:,} operational records across {operational_tables} tables")
    print(f"   - Core business data: {customers:,} customers, {orders:,} orders, {visits:,} visits")
    print(f"   - Active operations: {current_workorders:,} current work orders, {partners:,} partner organizations")
    print(f"   - Historical data: {historical_workorders:,} historical work orders, {agenda_historical:,} historical agenda items")
    print(f"   - Product catalog: {products:,} products, {stations:,} registered charging stations")
    print(f"   - Team operations: {members:,} team members, {day_teams:,} daily assignments")
    
    print(f"\n✅ Analysis complete! Smartsuite is clearly the primary operational database.")
    print(f"💡 Next step: Update PRD with these findings and plan Xano migration strategy.")

if __name__ == "__main__":
    analyze_smartsuite_data() 