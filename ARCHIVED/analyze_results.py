#!/usr/bin/env python3
"""
Analyze ChargeCars MCP Results
"""

import json

def analyze_results():
    with open('chargecars_system_analysis.json', 'r') as f:
        data = json.load(f)
    
    print("🔍 CHARGECARS MCP DATA ANALYSIS")
    print("=" * 50)
    
    # Overview
    print("\n📊 EXTRACTED DATA OVERVIEW:")
    for system, content in data.items():
        if isinstance(content, dict):
            total_items = sum(len(v) if isinstance(v, list) else 1 for v in content.values())
            print(f"  {system}: {total_items} total items")
            for subsection, items in content.items():
                if isinstance(items, list):
                    print(f"    - {subsection}: {len(items)} items")
        elif isinstance(content, list):
            print(f"  {system}: {len(content)} items")
    
    # ClickUp Analysis
    clickup_data = data.get('clickup', {})
    print(f"\n🎯 CLICKUP SPACES FOUND:")
    spaces = clickup_data.get('spaces', [])
    for space in spaces:
        print(f"  - {space['name']} (ID: {space['id']})")
        print(f"    Color: {space['color']}, Private: {space['private']}")
        statuses = space.get('statuses', [])
        print(f"    Statuses: {[s['status'] for s in statuses]}")
    
    # Lists analysis
    lists = clickup_data.get('lists', [])
    print(f"\n📋 CLICKUP LISTS FOUND ({len(lists)} total):")
    for lst in lists[:10]:  # Show first 10
        print(f"  - {lst.get('name', 'Unknown')} (ID: {lst.get('id', 'Unknown')})")
        if lst.get('task_count'):
            print(f"    Tasks: {lst['task_count']}")
    
    # Tasks analysis
    tasks = clickup_data.get('tasks', [])
    print(f"\n✅ CLICKUP TASKS FOUND ({len(tasks)} total):")
    for task in tasks[:10]:  # Show first 10
        print(f"  - {task.get('name', 'Unknown')} (ID: {task.get('id', 'Unknown')})")
        print(f"    Status: {task.get('status', {}).get('status', 'Unknown')}")
        if task.get('assignees'):
            assignees = [a.get('username', 'Unknown') for a in task['assignees']]
            print(f"    Assignees: {assignees}")
    
    # System Documentation
    sys_doc = data.get('system_documentation', {})
    if sys_doc:
        print(f"\n📝 SYSTEM DOCUMENTATION:")
        print(f"  Data Quality Score: {sys_doc.get('data_quality_score', 'N/A')}")
        print(f"  Total Records: {sys_doc.get('total_records_extracted', 'N/A')}")
        print(f"  Extraction Time: {sys_doc.get('extraction_timestamp', 'N/A')}")
    
    # Migration recommendations
    migration = sys_doc.get('migration_recommendations', [])
    if migration:
        print(f"\n🚀 MIGRATION RECOMMENDATIONS:")
        for rec in migration:
            print(f"  - {rec.get('recommendation', 'Unknown')}")
            print(f"    Priority: {rec.get('priority', 'Unknown')}")
    
    print(f"\n✅ Analysis complete! Full data available in chargecars_system_analysis.json")

if __name__ == "__main__":
    analyze_results() 