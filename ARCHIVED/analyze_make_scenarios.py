#!/usr/bin/env python3
"""
Analyze Make.com scenarios for business insights
"""

import json
import re
from collections import defaultdict, Counter
from datetime import datetime

def load_scenarios():
    """Load scenarios from JSON file"""
    with open('make_scenarios_data.json', 'r', encoding='utf-8') as f:
        return json.load(f)

def analyze_business_patterns(scenarios):
    """Analyze business patterns in the scenarios"""
    
    patterns = {
        'lead_generation': [],
        'customer_management': [],
        'order_processing': [],
        'communication': [],
        'data_integration': [],
        'validation': [],
        'automation_tools': [],
        'partner_integration': []
    }
    
    # Keywords for pattern matching
    keywords = {
        'lead_generation': ['leadgen', 'offerte', 'quote', 'lead', 'intake'],
        'customer_management': ['klant', 'customer', 'contact', 'hubspot'],
        'order_processing': ['order', 'bestelling', 'job', 'werkbon'],
        'communication': ['email', 'notification', 'parsing', 'handtekening'],
        'data_integration': ['smartsuite', 'clickup', 'sync', 'import'],
        'validation': ['validatie', 'validation', 'adres', 'address'],
        'automation_tools': ['token', 'auth', 'api', 'webhook'],
        'partner_integration': ['50five', 'groendus', 'eneco', 'alva']
    }
    
    for scenario in scenarios:
        title = scenario.get('title', '').lower()
        folder = scenario.get('folder', '').lower()
        
        for pattern, pattern_keywords in keywords.items():
            if any(keyword in title or keyword in folder for keyword in pattern_keywords):
                patterns[pattern].append(scenario)
    
    return patterns

def analyze_app_usage(scenarios):
    """Analyze which apps are used most frequently"""
    
    app_usage = Counter()
    app_combinations = defaultdict(int)
    
    for scenario in scenarios:
        apps = scenario.get('connected_apps', [])
        
        # Count individual app usage
        for app in apps:
            if app and app != 'null':
                app_usage[app] += 1
        
        # Count app combinations (for apps that appear together)
        if len(apps) > 1:
            clean_apps = [app for app in apps if app and app != 'null']
            if len(clean_apps) > 1:
                combo = ' + '.join(sorted(clean_apps))
                app_combinations[combo] += 1
    
    return app_usage, app_combinations

def analyze_operational_metrics(scenarios):
    """Analyze operational metrics"""
    
    total_operations = sum(scenario.get('operations', 0) for scenario in scenarios)
    active_scenarios = len([s for s in scenarios if s.get('status') == 'active'])
    
    # Operations by category
    high_volume = [s for s in scenarios if s.get('operations', 0) > 1000]
    medium_volume = [s for s in scenarios if 100 <= s.get('operations', 0) <= 1000]
    low_volume = [s for s in scenarios if 0 < s.get('operations', 0) < 100]
    unused = [s for s in scenarios if s.get('operations', 0) == 0]
    
    return {
        'total_operations': total_operations,
        'active_scenarios': active_scenarios,
        'high_volume': high_volume,
        'medium_volume': medium_volume,
        'low_volume': low_volume,
        'unused': unused
    }

def analyze_folders(scenarios):
    """Analyze folder organization"""
    
    folders = defaultdict(list)
    no_folder = []
    
    for scenario in scenarios:
        folder = scenario.get('folder')
        if folder:
            # Clean folder name
            clean_folder = re.sub(r'\s+', ' ', folder.strip())
            folders[clean_folder].append(scenario)
        else:
            no_folder.append(scenario)
    
    return folders, no_folder

def generate_business_insights(scenarios):
    """Generate comprehensive business insights"""
    
    insights = []
    
    # Load and analyze data
    patterns = analyze_business_patterns(scenarios)
    app_usage, app_combinations = analyze_app_usage(scenarios)
    metrics = analyze_operational_metrics(scenarios)
    folders, no_folder = analyze_folders(scenarios)
    
    insights.append("# ChargeCars Make.com Business Analysis")
    insights.append(f"Generated on: {datetime.now().strftime('%Y-%m-%d %H:%M:%S')}")
    insights.append("")
    
    # Executive Summary
    insights.append("## Executive Summary")
    insights.append("")
    insights.append(f"ChargeCars operates **{len(scenarios)} active automation scenarios** processing **{metrics['total_operations']:,} operations** total.")
    insights.append(f"The automation platform handles everything from lead generation to customer management and partner integrations.")
    insights.append("")
    
    # Key Metrics
    insights.append("## Key Operational Metrics")
    insights.append("")
    insights.append(f"- **Total Scenarios**: {len(scenarios)}")
    insights.append(f"- **Active Scenarios**: {metrics['active_scenarios']}")
    insights.append(f"- **Total Operations**: {metrics['total_operations']:,}")
    insights.append(f"- **High Volume Scenarios** (>1000 ops): {len(metrics['high_volume'])}")
    insights.append(f"- **Medium Volume Scenarios** (100-1000 ops): {len(metrics['medium_volume'])}")
    insights.append(f"- **Low Volume Scenarios** (<100 ops): {len(metrics['low_volume'])}")
    insights.append(f"- **Unused Scenarios**: {len(metrics['unused'])}")
    insights.append("")
    
    # Business Process Analysis
    insights.append("## Business Process Coverage")
    insights.append("")
    
    for pattern_name, pattern_scenarios in patterns.items():
        if pattern_scenarios:
            total_ops = sum(s.get('operations', 0) for s in pattern_scenarios)
            insights.append(f"### {pattern_name.replace('_', ' ').title()}")
            insights.append(f"- **Scenarios**: {len(pattern_scenarios)}")
            insights.append(f"- **Total Operations**: {total_ops:,}")
            insights.append("- **Key Scenarios**:")
            
            # Show top 3 scenarios by operations
            top_scenarios = sorted(pattern_scenarios, key=lambda x: x.get('operations', 0), reverse=True)[:3]
            for scenario in top_scenarios:
                ops = scenario.get('operations', 0)
                insights.append(f"  - {scenario.get('title', 'Untitled')}: {ops:,} operations")
            insights.append("")
    
    # Technology Stack Analysis
    insights.append("## Technology Integration Analysis")
    insights.append("")
    insights.append("### Most Used Applications")
    insights.append("")
    
    for app, count in app_usage.most_common(10):
        percentage = (count / len(scenarios)) * 100
        insights.append(f"- **{app}**: {count} scenarios ({percentage:.1f}%)")
    insights.append("")
    
    # Critical Scenarios
    insights.append("## Critical High-Volume Scenarios")
    insights.append("")
    insights.append("These scenarios handle the majority of ChargeCars' automated operations:")
    insights.append("")
    
    for scenario in metrics['high_volume']:
        ops = scenario.get('operations', 0)
        apps = ', '.join([app for app in scenario.get('connected_apps', []) if app and app != 'null'])
        insights.append(f"### {scenario.get('title', 'Untitled')}")
        insights.append(f"- **Operations**: {ops:,}")
        insights.append(f"- **Connected Apps**: {apps}")
        insights.append(f"- **Created**: {scenario.get('creation_date', 'N/A')}")
        
        # Business impact analysis
        if 'adres' in scenario.get('title', '').lower() or 'address' in scenario.get('title', '').lower():
            insights.append("- **Business Impact**: Address validation for all customer orders")
        elif 'hubspot' in scenario.get('title', '').lower():
            insights.append("- **Business Impact**: CRM synchronization and lead management")
        elif 'email' in scenario.get('title', '').lower():
            insights.append("- **Business Impact**: Automated email processing and communication")
        elif 'token' in scenario.get('title', '').lower():
            insights.append("- **Business Impact**: API authentication and security")
        
        insights.append("")
    
    # Partner Integration Analysis
    insights.append("## Partner Integration Analysis")
    insights.append("")
    
    partner_scenarios = patterns['partner_integration']
    if partner_scenarios:
        insights.append(f"ChargeCars has **{len(partner_scenarios)} partner integration scenarios**:")
        insights.append("")
        
        partners = set()
        for scenario in partner_scenarios:
            title = scenario.get('title', '').lower()
            if '50five' in title:
                partners.add('50five')
            elif 'groendus' in title:
                partners.add('Groendus')
            elif 'eneco' in title:
                partners.add('Eneco')
            elif 'alva' in title:
                partners.add('Alva')
        
        insights.append(f"**Active Partners**: {', '.join(sorted(partners))}")
        insights.append("")
        
        for scenario in partner_scenarios:
            ops = scenario.get('operations', 0)
            insights.append(f"- **{scenario.get('title', 'Untitled')}**: {ops:,} operations")
        insights.append("")
    
    # Recommendations
    insights.append("## Strategic Recommendations")
    insights.append("")
    
    insights.append("### 1. Optimization Opportunities")
    if metrics['unused']:
        insights.append(f"- **Review {len(metrics['unused'])} unused scenarios** - Consider archiving or activating")
    
    high_volume_count = len(metrics['high_volume'])
    if high_volume_count < 5:
        insights.append("- **Expand automation coverage** - Only a few scenarios handle most operations")
    
    insights.append("")
    
    insights.append("### 2. Integration Consolidation")
    if app_usage['SmartSuite'] > 15:
        insights.append("- **SmartSuite is heavily integrated** - Consider API optimization")
    if app_usage['Webhooks'] > 20:
        insights.append("- **High webhook usage** - Monitor for rate limits and reliability")
    insights.append("")
    
    insights.append("### 3. Business Process Automation")
    lead_gen_ops = sum(s.get('operations', 0) for s in patterns['lead_generation'])
    customer_ops = sum(s.get('operations', 0) for s in patterns['customer_management'])
    
    if lead_gen_ops > customer_ops:
        insights.append("- **Lead generation is highly automated** - Focus on customer lifecycle automation")
    else:
        insights.append("- **Customer management is well automated** - Consider lead generation optimization")
    
    insights.append("")
    
    return '\n'.join(insights)

def main():
    """Main function"""
    
    print("Analyzing Make.com scenarios for business insights...")
    
    try:
        scenarios = load_scenarios()
        
        # Generate comprehensive analysis
        analysis = generate_business_insights(scenarios)
        
        # Save analysis
        with open('make_scenarios_business_analysis.md', 'w', encoding='utf-8') as f:
            f.write(analysis)
        
        print("Generated business analysis: make_scenarios_business_analysis.md")
        
        # Quick summary
        patterns = analyze_business_patterns(scenarios)
        metrics = analyze_operational_metrics(scenarios)
        
        print(f"\n=== BUSINESS INSIGHTS ===")
        print(f"Total automation operations: {metrics['total_operations']:,}")
        print(f"High-volume scenarios: {len(metrics['high_volume'])}")
        print(f"Partner integrations: {len(patterns['partner_integration'])}")
        print(f"Lead generation scenarios: {len(patterns['lead_generation'])}")
        print(f"Customer management scenarios: {len(patterns['customer_management'])}")
        
    except Exception as e:
        print(f"Error: {e}")
        import traceback
        traceback.print_exc()

if __name__ == "__main__":
    main() 