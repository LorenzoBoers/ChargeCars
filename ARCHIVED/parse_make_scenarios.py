#!/usr/bin/env python3
"""
Parse Make.com scenarios HTML and extract scenario information
"""

import re
import json
from bs4 import BeautifulSoup
from datetime import datetime

def parse_scenarios_html(html_file):
    """Parse the HTML file and extract scenario information"""
    
    with open(html_file, 'r', encoding='utf-8') as f:
        html_content = f.read()
    
    soup = BeautifulSoup(html_content, 'html.parser')
    
    scenarios = []
    
    # Find all scenario items
    scenario_items = soup.find_all('scenarios-list-item')
    
    for item in scenario_items:
        scenario = {}
        
        # Extract scenario URL and ID
        link = item.find('a', href=True)
        if link:
            href = link['href']
            scenario['url'] = href
            # Extract scenario ID from URL like /204073/scenarios/2731430/edit
            id_match = re.search(r'/scenarios/(\d+)/', href)
            if id_match:
                scenario['id'] = id_match.group(1)
        
        # Extract scenario title
        title_div = item.find('div', class_='list-group-title')
        if title_div:
            scenario['title'] = title_div.get_text(strip=True)
        
        # Extract folder information
        folder_span = item.find('span', class_='scenario-folder')
        if folder_span:
            scenario['folder'] = folder_span.get_text(strip=True)
        
        # Extract execution count (operations)
        operations_spans = item.find_all('span', class_='mr-2')
        for span in operations_spans:
            prev_i = span.find_previous_sibling('i')
            if prev_i and 'fa-cog' in prev_i.get('class', []):
                try:
                    scenario['operations'] = int(span.get_text(strip=True))
                except ValueError:
                    pass
        
        # Extract data transfer
        for span in operations_spans:
            prev_i = span.find_previous_sibling('i')
            if prev_i and 'fa-angle-double-down' in prev_i.get('class', []):
                scenario['data_transfer'] = span.get_text(strip=True)
        
        # Extract creation date
        date_span = item.find('span', {'data-testid': 'scenario-creation-date'})
        if date_span:
            date_text = date_span.find('span', class_='mr-2')
            if date_text:
                scenario['creation_date'] = date_text.get_text(strip=True)
        
        # Extract creator
        user_spans = item.find_all('span', class_='mr-2')
        for span in user_spans:
            prev_i = span.find_previous_sibling('i')
            if prev_i and 'fa-user' in prev_i.get('class', []):
                scenario['creator'] = span.get_text(strip=True)
        
        # Extract connected apps/services
        apps = []
        pkg_icons = item.find_all('img')
        for img in pkg_icons:
            alt_text = img.get('alt', '')
            if alt_text and alt_text not in apps:
                apps.append(alt_text)
        
        # Check for additional apps indicator (+X)
        plus_divs = item.find_all('div', class_='pkg-icon last ng-star-inserted')
        for div in plus_divs:
            text = div.get_text(strip=True)
            if text.startswith('+'):
                scenario['additional_apps'] = text
        
        scenario['connected_apps'] = apps
        
        # Check if scenario is active
        switch = item.find('imt-ui-switch')
        if switch:
            label = switch.find('label')
            if label and 'active' in label.get('class', []):
                scenario['status'] = 'active'
            else:
                scenario['status'] = 'inactive'
        
        scenarios.append(scenario)
    
    return scenarios

def generate_documentation(scenarios):
    """Generate comprehensive documentation from scenarios"""
    
    doc = []
    doc.append("# ChargeCars Make.com Scenarios Documentation")
    doc.append(f"Generated on: {datetime.now().strftime('%Y-%m-%d %H:%M:%S')}")
    doc.append(f"Total scenarios found: {len(scenarios)}")
    doc.append("")
    
    # Group by folder
    folders = {}
    no_folder = []
    
    for scenario in scenarios:
        folder = scenario.get('folder')
        if folder:
            if folder not in folders:
                folders[folder] = []
            folders[folder].append(scenario)
        else:
            no_folder.append(scenario)
    
    # Summary statistics
    doc.append("## Summary Statistics")
    doc.append("")
    
    total_operations = sum(scenario.get('operations', 0) for scenario in scenarios)
    active_scenarios = len([s for s in scenarios if s.get('status') == 'active'])
    
    doc.append(f"- **Total Operations**: {total_operations:,}")
    doc.append(f"- **Active Scenarios**: {active_scenarios}/{len(scenarios)}")
    doc.append(f"- **Folders**: {len(folders)}")
    doc.append("")
    
    # Connected services analysis
    all_apps = set()
    for scenario in scenarios:
        all_apps.update(scenario.get('connected_apps', []))
    
    doc.append("## Connected Services")
    doc.append("")
    for app in sorted(all_apps):
        count = sum(1 for s in scenarios if app in s.get('connected_apps', []))
        doc.append(f"- **{app}**: {count} scenarios")
    doc.append("")
    
    # Scenarios by folder
    if folders:
        doc.append("## Scenarios by Folder")
        doc.append("")
        
        for folder_name, folder_scenarios in folders.items():
            doc.append(f"### {folder_name}")
            doc.append("")
            
            for scenario in folder_scenarios:
                doc.append(f"#### {scenario.get('title', 'Untitled')}")
                doc.append("")
                doc.append(f"- **ID**: {scenario.get('id', 'N/A')}")
                doc.append(f"- **Status**: {scenario.get('status', 'Unknown')}")
                doc.append(f"- **Operations**: {scenario.get('operations', 0):,}")
                doc.append(f"- **Data Transfer**: {scenario.get('data_transfer', 'N/A')}")
                doc.append(f"- **Created**: {scenario.get('creation_date', 'N/A')}")
                doc.append(f"- **Creator**: {scenario.get('creator', 'N/A')}")
                
                apps = scenario.get('connected_apps', [])
                if apps:
                    doc.append(f"- **Connected Apps**: {', '.join(apps)}")
                
                additional = scenario.get('additional_apps')
                if additional:
                    doc.append(f"- **Additional Apps**: {additional}")
                
                doc.append("")
    
    # Scenarios without folder
    if no_folder:
        doc.append("## General Scenarios")
        doc.append("")
        
        for scenario in no_folder:
            doc.append(f"### {scenario.get('title', 'Untitled')}")
            doc.append("")
            doc.append(f"- **ID**: {scenario.get('id', 'N/A')}")
            doc.append(f"- **Status**: {scenario.get('status', 'Unknown')}")
            doc.append(f"- **Operations**: {scenario.get('operations', 0):,}")
            doc.append(f"- **Data Transfer**: {scenario.get('data_transfer', 'N/A')}")
            doc.append(f"- **Created**: {scenario.get('creation_date', 'N/A')}")
            doc.append(f"- **Creator**: {scenario.get('creator', 'N/A')}")
            
            apps = scenario.get('connected_apps', [])
            if apps:
                doc.append(f"- **Connected Apps**: {', '.join(apps)}")
            
            additional = scenario.get('additional_apps')
            if additional:
                doc.append(f"- **Additional Apps**: {additional}")
            
            doc.append("")
    
    return '\n'.join(doc)

def main():
    """Main function"""
    
    print("Parsing Make.com scenarios HTML...")
    
    try:
        scenarios = parse_scenarios_html('makescenarios.html')
        
        print(f"Found {len(scenarios)} scenarios")
        
        # Save raw data as JSON
        with open('make_scenarios_data.json', 'w', encoding='utf-8') as f:
            json.dump(scenarios, f, indent=2, ensure_ascii=False)
        
        print("Saved raw data to make_scenarios_data.json")
        
        # Generate documentation
        documentation = generate_documentation(scenarios)
        
        # Save documentation
        with open('make_scenarios_documentation.md', 'w', encoding='utf-8') as f:
            f.write(documentation)
        
        print("Generated documentation: make_scenarios_documentation.md")
        
        # Print summary
        print("\n=== SUMMARY ===")
        total_operations = sum(scenario.get('operations', 0) for scenario in scenarios)
        active_scenarios = len([s for s in scenarios if s.get('status') == 'active'])
        
        print(f"Total scenarios: {len(scenarios)}")
        print(f"Active scenarios: {active_scenarios}")
        print(f"Total operations: {total_operations:,}")
        
        # Show top scenarios by operations
        top_scenarios = sorted(scenarios, key=lambda x: x.get('operations', 0), reverse=True)[:5]
        print("\nTop 5 scenarios by operations:")
        for i, scenario in enumerate(top_scenarios, 1):
            title = scenario.get('title', 'Untitled')
            ops = scenario.get('operations', 0)
            print(f"{i}. {title}: {ops:,} operations")
        
    except Exception as e:
        print(f"Error: {e}")
        import traceback
        traceback.print_exc()

if __name__ == "__main__":
    main() 