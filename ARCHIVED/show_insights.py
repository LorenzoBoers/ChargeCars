#!/usr/bin/env python3
import json

# Load the data
with open('chargecars_system_analysis.json', 'r') as f:
    data = json.load(f)

print("=== KEY MCP EXTRACTION INSIGHTS ===")

# Migration recommendations
doc = data.get('system_documentation', {})
recommendations = doc.get('migration_recommendations', [])
print(f"\nMIGRATION RECOMMENDATIONS ({len(recommendations)}):")
for rec in recommendations:
    print(f"- {rec}")

# Customer journey analysis
journey = data.get('customer_journey_analysis', {})
bottlenecks = journey.get('workflow_bottlenecks', [])
print(f"\nWORKFLOW BOTTLENECKS ({len(bottlenecks)}):")
for bottleneck in bottlenecks:
    print(f"- {bottleneck}")

# Key ClickUp findings
clickup = data.get('clickup', {})
spaces = clickup.get('spaces', [])
print(f"\nOPERATIONAL SPACES ({len(spaces)}):")
for space in spaces:
    print(f"- {space['name']}: {[s['status'] for s in space.get('statuses', [])]}")

# Product analysis
tasks = clickup.get('tasks', [])
product_tasks = [t for t in tasks if 'Alfen' in t.get('name', '')]
print(f"\nPRODUCT CATALOG ITEMS ({len(product_tasks)}):")
for task in product_tasks[:5]:
    print(f"- {task.get('name', 'Unknown')}")

print(f"\n✅ Total ClickUp data extracted: {len(spaces)} spaces, {len(clickup.get('lists', []))} lists, {len(tasks)} tasks") 