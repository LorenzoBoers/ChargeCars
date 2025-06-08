#!/usr/bin/env python3
"""
ChargeCars V2 Documentation Update Script
Updates all documentation files to use singular table names
"""

import os
import re
from pathlib import Path

# Mapping of plural to singular table names
TABLE_MAPPINGS = {
    # Core business tables
    'organizations': 'organization',
    'contacts': 'contact', 
    'articles': 'article',
    'orders': 'order',
    'quotes': 'quote',
    'addresses': 'address',
    'invoices': 'invoice',
    'payments': 'payment',
    'documents': 'document',
    
    # Component & junction tables
    'article_components': 'article_component',
    'line_items': 'line_item',
    'form_submissions': 'form_submission',
    'submission_files': 'submission_file',
    'submission_line_items': 'submission_line_item',
    'sign_offs': 'sign_off',
    'sign_off_line_items': 'sign_off_line_item',
    
    # System & configuration tables
    'intake_forms': 'intake_form',
    'form_field_templates': 'form_field_template',
    'form_analytics': 'form_analytic',
    'installation_teams': 'installation_team',
    'service_regions': 'service_region',
    'partner_commissions': 'partner_commission',
    'partner_integrations': 'partner_integration',
    
    # Communication & workflow tables
    'communication_channels': 'communication_channel',
    'communication_threads': 'communication_thread',
    'communication_messages': 'communication_message',
    'communication_templates': 'communication_template',
    'internal_tasks': 'internal_task',
    'status_workflows': 'status_workflow',
    'status_workflow_steps': 'status_workflow_step',
    
    # Audit & security tables
    'security_events': 'security_event',
    'rate_limits': 'rate_limit',
    'number_sequences': 'number_sequence',
    
    # Additional specific updates
    'visits': 'visit',
    'work_orders': 'work_order',
    'vehicles': 'vehicle',
    'daily_team_compositions': 'daily_team_composition',
    'team_vehicle_assignments': 'team_vehicle_assignment',
    'technician_absences': 'technician_absence',
    'notification_preferences': 'notification_preference',
    'customer_feedbacks': 'customer_feedback',
    'installation_performances': 'installation_performance',
}

def update_file_content(file_path):
    """Update a single file's content with table name mappings"""
    try:
        with open(file_path, 'r', encoding='utf-8') as f:
            content = f.read()
        
        original_content = content
        
        # Update table references in various contexts
        for plural, singular in TABLE_MAPPINGS.items():
            # Update FK references (FK → table_name)
            content = re.sub(
                rf'(FK → ){plural}(\))', 
                rf'\1{singular}\2', 
                content
            )
            
            # Update table names in markdown headers
            content = re.sub(
                rf'(###?\s+\*\*){plural}(\*\*)', 
                rf'\1{singular}\2', 
                content
            )
            
            # Update table names in code blocks
            content = re.sub(
                rf'`{plural}`', 
                f'`{singular}`', 
                content
            )
            
            # Update table names in parenthetical references  
            content = re.sub(
                rf'\({plural}\)', 
                f'({singular})', 
                content
            )
            
            # Update table names after "table" keyword
            content = re.sub(
                rf'(table\s+){plural}(\s|$)', 
                rf'\1{singular}\2', 
                content, 
                flags=re.IGNORECASE
            )
            
            # Update table names in URLs or endpoint paths
            content = re.sub(
                rf'/{plural}/', 
                f'/{singular}/', 
                content
            )
        
        # Only write if content changed
        if content != original_content:
            with open(file_path, 'w', encoding='utf-8') as f:
                f.write(content)
            return True
        
        return False
        
    except Exception as e:
        print(f"Error updating {file_path}: {e}")
        return False

def main():
    """Main function to update all documentation files"""
    print("🔄 Starting documentation update for singular table names...")
    
    # Define documentation directories to update
    doc_dirs = [
        'documentation/organized-documentation',
    ]
    
    updated_files = []
    total_files = 0
    
    for doc_dir in doc_dirs:
        if os.path.exists(doc_dir):
            # Find all .md files
            for root, dirs, files in os.walk(doc_dir):
                for file in files:
                    if file.endswith('.md'):
                        file_path = os.path.join(root, file)
                        total_files += 1
                        
                        if update_file_content(file_path):
                            updated_files.append(file_path)
                            print(f"✅ Updated: {file_path}")
    
    print(f"\n🎉 Documentation update completed!")
    print(f"📊 Files processed: {total_files}")
    print(f"📝 Files updated: {len(updated_files)}")
    
    if updated_files:
        print(f"\n📋 Updated files:")
        for file_path in updated_files:
            print(f"  - {file_path}")
    
    return len(updated_files)

if __name__ == "__main__":
    main() 