#!/usr/bin/env python3
"""
ChargeCars V2 Implementation Guides Cleanup
Archives redundant files while keeping essential implementation code
"""

import os
import shutil
from pathlib import Path

# Base directory
guides_dir = Path("documentation/organized-documentation/03-implementation-guides")
archive_dir = guides_dir / "archive"

# Files to KEEP (essential implementation code)
KEEP_FILES = {
    "MASTER_IMPLEMENTATION_SUMMARY.md",
    "Ready_To_Implement_APIs.md",  # Copy-paste Xano functions
    "Business_Entity_Number_Generation.md",  # Dutch compliance code
    "Partner_Integration_Fix_Complete.md",  # Schema fixes
    "Google_Maps_Integration_Complete_Guide.md",  # PostcodeAPI integration
    "Multi_Entity_Communication_Channels.md",  # Communication system
    "Security_Access_Control_Implementation.md",  # RBAC implementation
    "Audit_Logging_Activity_Feed_System.md",  # Audit system
    "Business_Entities_Management_System.md",  # Multi-entity support
}

# Files to ARCHIVE (redundant or planning docs)
ARCHIVE_FILES = {
    "API_Implementation_Plan.md",
    "Quick_Start_API_Implementation.md", 
    "Status_Engine_Implementation_Tasks.md",
    "Status_Engine_Implementation_Guide.md",
    "Step_By_Step_Implementation_Guide.md",
    "UUID_Conversion_Status.md",
    "SmartSuite_Xano_Migration_Status.md",
    "Migration_Final_Status.md", 
    "Technical_Implementation_Guide.md",
    "Xano_Manual_Implementation_Tasks.md",
    "Enhanced_Quote_System_Guide.md",
    "ChargeCars_V2_Quote_Process_Implementation.md",
    "ChargeCars_V2_Critical_Fixes_Implemented.md",
    "Database_Schema_Type_Optimization.md",
    "External_Integrations_Specification.md",
    "Multichannel_Communication_System.md",
    "Notification_Center_Implementation.md",
    "Number_Generation_System.md",
    "Partner_External_References_System.md",
    "Postcode_API_Implementation_Guide.md",
    "Security_Implementation_Status.md",
    "Audit_Logging_Practical_Examples.md",
    "Dynamic_Team_Management_Implementation.md",
}

def cleanup_guides():
    """Clean up implementation guides folder"""
    
    print("🧹 Starting Implementation Guides Cleanup...")
    print(f"📁 Working in: {guides_dir}")
    
    # Ensure archive directory exists
    archive_dir.mkdir(exist_ok=True)
    
    # Get all markdown files in guides directory
    all_files = [f for f in guides_dir.iterdir() if f.is_file() and f.name.endswith('.md')]
    
    archived_count = 0
    kept_count = 0
    
    print(f"\n📋 Processing {len(all_files)} files...")
    
    for file_path in all_files:
        filename = file_path.name
        
        if filename in KEEP_FILES:
            print(f"✅ KEEPING: {filename}")
            kept_count += 1
            
        elif filename in ARCHIVE_FILES:
            try:
                archive_path = archive_dir / filename
                shutil.move(str(file_path), str(archive_path))
                print(f"📦 ARCHIVED: {filename}")
                archived_count += 1
            except Exception as e:
                print(f"❌ ERROR archiving {filename}: {e}")
                
        else:
            # Unknown file - ask what to do
            print(f"❓ UNKNOWN: {filename} (keeping by default)")
            kept_count += 1
    
    print(f"\n🎉 Cleanup completed!")
    print(f"✅ Files kept: {kept_count}")
    print(f"📦 Files archived: {archived_count}")
    
    # Show current structure
    print(f"\n📁 Current implementation guides structure:")
    remaining_files = [f.name for f in guides_dir.iterdir() if f.is_file() and f.name.endswith('.md')]
    for filename in sorted(remaining_files):
        print(f"   📄 {filename}")
    
    print(f"\n📦 Archived files in /archive/:")
    archived_files = [f.name for f in archive_dir.iterdir() if f.is_file() and f.name.endswith('.md')]
    for filename in sorted(archived_files):
        print(f"   📄 {filename}")

if __name__ == "__main__":
    cleanup_guides() 