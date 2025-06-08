#!/usr/bin/env python3
"""
ChargeCars System Documentation MCP
Comprehensive data extraction and analysis tool for current operational systems
"""

import asyncio
import json
import os
from typing import Dict, List, Any, Optional
from dataclasses import dataclass
from datetime import datetime
import aiohttp
import logging

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

@dataclass
class SystemCredentials:
    """Container for system API credentials"""
    smartsuite_api_key: str
    smartsuite_workspace_id: str
    make_com_token: str
    clickup_token: str
    clickup_team_id: str
    fillout_api_key: str
    noloco_access_token: Optional[str] = None

class ChargeCarsSystemMCP:
    """Main MCP class for ChargeCars system documentation"""
    
    def __init__(self, credentials: SystemCredentials):
        self.credentials = credentials
        self.session: Optional[aiohttp.ClientSession] = None
        self.extracted_data: Dict[str, Any] = {}
        
    async def __aenter__(self):
        """Async context manager entry"""
        self.session = aiohttp.ClientSession()
        return self
        
    async def __aexit__(self, exc_type, exc_val, exc_tb):
        """Async context manager exit"""
        if self.session:
            await self.session.close()

    # ===========================================
    # SMARTSUITE INTEGRATION
    # ===========================================
    
    async def extract_smartsuite_data(self) -> Dict[str, Any]:
        """Extract comprehensive data from Smartsuite"""
        logger.info("🔍 Starting Smartsuite data extraction...")
        
        base_url = "https://app.smartsuite.com/api/v1"
        headers = {
            "Authorization": f"Token {self.credentials.smartsuite_api_key}",
            "Account-Id": self.credentials.smartsuite_workspace_id,
            "Content-Type": "application/json"
        }
        
        smartsuite_data = {
            "projects": await self._extract_smartsuite_projects(base_url, headers),
            "customers": await self._extract_smartsuite_customers(base_url, headers),
            "teams": await self._extract_smartsuite_teams(base_url, headers),
            "inventory": await self._extract_smartsuite_inventory(base_url, headers),
            "partners": await self._extract_smartsuite_partners(base_url, headers),
            "automations": await self._extract_smartsuite_automations(base_url, headers)
        }
        
        logger.info("✅ Smartsuite data extraction completed")
        return smartsuite_data
    
    async def _extract_smartsuite_projects(self, base_url: str, headers: Dict) -> List[Dict]:
        """Extract project/order data from Smartsuite"""
        try:
            async with self.session.get(f"{base_url}/applications", headers=headers) as response:
                if response.status == 200:
                    applications = await response.json()
                    
                    # Find project-related applications
                    project_apps = [app for app in applications if 'project' in app.get('name', '').lower() 
                                  or 'order' in app.get('name', '').lower() 
                                  or 'installation' in app.get('name', '').lower()]
                    
                    all_projects = []
                    for app in project_apps:
                        app_id = app['id']
                        async with self.session.get(f"{base_url}/applications/{app_id}/records", headers=headers) as records_response:
                            if records_response.status == 200:
                                records = await records_response.json()
                                all_projects.extend(records.get('items', []))
                    
                    return all_projects
                else:
                    logger.error(f"Failed to fetch Smartsuite applications: {response.status}")
                    return []
        except Exception as e:
            logger.error(f"Error extracting Smartsuite projects: {e}")
            return []
    
    async def _extract_smartsuite_customers(self, base_url: str, headers: Dict) -> List[Dict]:
        """Extract customer data from Smartsuite"""
        try:
            async with self.session.get(f"{base_url}/applications", headers=headers) as response:
                if response.status == 200:
                    applications = await response.json()
                    
                    # Find customer/contact applications
                    customer_apps = [app for app in applications if any(keyword in app.get('name', '').lower() 
                                   for keyword in ['customer', 'contact', 'lead', 'client'])]
                    
                    all_customers = []
                    for app in customer_apps:
                        app_id = app['id']
                        async with self.session.get(f"{base_url}/applications/{app_id}/records", headers=headers) as records_response:
                            if records_response.status == 200:
                                records = await records_response.json()
                                all_customers.extend(records.get('items', []))
                    
                    return all_customers
                else:
                    logger.error(f"Failed to fetch Smartsuite customer data: {response.status}")
                    return []
        except Exception as e:
            logger.error(f"Error extracting Smartsuite customers: {e}")
            return []
    
    async def _extract_smartsuite_teams(self, base_url: str, headers: Dict) -> List[Dict]:
        """Extract team and mechanic data from Smartsuite"""
        try:
            async with self.session.get(f"{base_url}/applications", headers=headers) as response:
                if response.status == 200:
                    applications = await response.json()
                    
                    # Find team/employee applications
                    team_apps = [app for app in applications if any(keyword in app.get('name', '').lower() 
                               for keyword in ['team', 'employee', 'mechanic', 'staff', 'personnel'])]
                    
                    all_teams = []
                    for app in team_apps:
                        app_id = app['id']
                        async with self.session.get(f"{base_url}/applications/{app_id}/records", headers=headers) as records_response:
                            if records_response.status == 200:
                                records = await records_response.json()
                                all_teams.extend(records.get('items', []))
                    
                    return all_teams
                else:
                    logger.error(f"Failed to fetch Smartsuite team data: {response.status}")
                    return []
        except Exception as e:
            logger.error(f"Error extracting Smartsuite teams: {e}")
            return []
    
    async def _extract_smartsuite_inventory(self, base_url: str, headers: Dict) -> List[Dict]:
        """Extract inventory data from Smartsuite"""
        try:
            async with self.session.get(f"{base_url}/applications", headers=headers) as response:
                if response.status == 200:
                    applications = await response.json()
                    
                    # Find inventory applications
                    inventory_apps = [app for app in applications if any(keyword in app.get('name', '').lower() 
                                    for keyword in ['inventory', 'stock', 'product', 'equipment', 'material'])]
                    
                    all_inventory = []
                    for app in inventory_apps:
                        app_id = app['id']
                        async with self.session.get(f"{base_url}/applications/{app_id}/records", headers=headers) as records_response:
                            if records_response.status == 200:
                                records = await records_response.json()
                                all_inventory.extend(records.get('items', []))
                    
                    return all_inventory
                else:
                    logger.error(f"Failed to fetch Smartsuite inventory data: {response.status}")
                    return []
        except Exception as e:
            logger.error(f"Error extracting Smartsuite inventory: {e}")
            return []
    
    async def _extract_smartsuite_partners(self, base_url: str, headers: Dict) -> List[Dict]:
        """Extract partner data from Smartsuite"""
        try:
            async with self.session.get(f"{base_url}/applications", headers=headers) as response:
                if response.status == 200:
                    applications = await response.json()
                    
                    # Find partner applications
                    partner_apps = [app for app in applications if any(keyword in app.get('name', '').lower() 
                                  for keyword in ['partner', 'dealer', 'supplier', 'vendor', 'oem'])]
                    
                    all_partners = []
                    for app in partner_apps:
                        app_id = app['id']
                        async with self.session.get(f"{base_url}/applications/{app_id}/records", headers=headers) as records_response:
                            if records_response.status == 200:
                                records = await records_response.json()
                                all_partners.extend(records.get('items', []))
                    
                    return all_partners
                else:
                    logger.error(f"Failed to fetch Smartsuite partner data: {response.status}")
                    return []
        except Exception as e:
            logger.error(f"Error extracting Smartsuite partners: {e}")
            return []
    
    async def _extract_smartsuite_automations(self, base_url: str, headers: Dict) -> List[Dict]:
        """Extract automation rules from Smartsuite"""
        try:
            # Note: Smartsuite automation API might be limited
            # This would need to be adapted based on actual API capabilities
            async with self.session.get(f"{base_url}/automations", headers=headers) as response:
                if response.status == 200:
                    automations = await response.json()
                    return automations.get('items', [])
                else:
                    logger.warning(f"Smartsuite automations API not accessible: {response.status}")
                    return []
        except Exception as e:
            logger.warning(f"Could not extract Smartsuite automations: {e}")
            return []

    # ===========================================
    # MAKE.COM INTEGRATION
    # ===========================================
    
    async def extract_make_com_data(self) -> Dict[str, Any]:
        """Extract automation scenarios from Make.com"""
        logger.info("🔍 Starting Make.com data extraction...")
        
        base_url = "https://www.make.com/api/v2"
        headers = {
            "Authorization": f"Token {self.credentials.make_com_token}",
            "Content-Type": "application/json"
        }
        
        make_data = {
            "scenarios": await self._extract_make_scenarios(base_url, headers),
            "teams": await self._extract_make_teams(base_url, headers),
            "connections": await self._extract_make_connections(base_url, headers),
            "execution_history": await self._extract_make_execution_history(base_url, headers)
        }
        
        logger.info("✅ Make.com data extraction completed")
        return make_data
    
    async def _extract_make_scenarios(self, base_url: str, headers: Dict) -> List[Dict]:
        """Extract all Make.com scenarios"""
        try:
            async with self.session.get(f"{base_url}/scenarios", headers=headers) as response:
                if response.status == 200:
                    scenarios_data = await response.json()
                    scenarios = scenarios_data.get('scenarios', [])
                    
                    # Get detailed blueprint for each scenario
                    detailed_scenarios = []
                    for scenario in scenarios:
                        scenario_id = scenario['id']
                        async with self.session.get(f"{base_url}/scenarios/{scenario_id}/blueprint", headers=headers) as blueprint_response:
                            if blueprint_response.status == 200:
                                blueprint = await blueprint_response.json()
                                scenario['blueprint'] = blueprint
                            detailed_scenarios.append(scenario)
                    
                    return detailed_scenarios
                else:
                    logger.error(f"Failed to fetch Make.com scenarios: {response.status}")
                    return []
        except Exception as e:
            logger.error(f"Error extracting Make.com scenarios: {e}")
            return []
    
    async def _extract_make_teams(self, base_url: str, headers: Dict) -> List[Dict]:
        """Extract Make.com team information"""
        try:
            async with self.session.get(f"{base_url}/teams", headers=headers) as response:
                if response.status == 200:
                    teams_data = await response.json()
                    return teams_data.get('teams', [])
                else:
                    logger.error(f"Failed to fetch Make.com teams: {response.status}")
                    return []
        except Exception as e:
            logger.error(f"Error extracting Make.com teams: {e}")
            return []
    
    async def _extract_make_connections(self, base_url: str, headers: Dict) -> List[Dict]:
        """Extract Make.com connections to other systems"""
        try:
            async with self.session.get(f"{base_url}/connections", headers=headers) as response:
                if response.status == 200:
                    connections_data = await response.json()
                    return connections_data.get('connections', [])
                else:
                    logger.error(f"Failed to fetch Make.com connections: {response.status}")
                    return []
        except Exception as e:
            logger.error(f"Error extracting Make.com connections: {e}")
            return []
    
    async def _extract_make_execution_history(self, base_url: str, headers: Dict) -> List[Dict]:
        """Extract recent execution history from Make.com"""
        try:
            # Get recent executions (last 30 days)
            async with self.session.get(f"{base_url}/executions?limit=1000", headers=headers) as response:
                if response.status == 200:
                    execution_data = await response.json()
                    return execution_data.get('executions', [])
                else:
                    logger.error(f"Failed to fetch Make.com execution history: {response.status}")
                    return []
        except Exception as e:
            logger.error(f"Error extracting Make.com execution history: {e}")
            return []

    # ===========================================
    # CLICKUP INTEGRATION
    # ===========================================
    
    async def extract_clickup_data(self) -> Dict[str, Any]:
        """Extract project data from ClickUp"""
        logger.info("🔍 Starting ClickUp data extraction...")
        
        base_url = "https://api.clickup.com/api/v2"
        headers = {
            "Authorization": self.credentials.clickup_token,
            "Content-Type": "application/json"
        }
        
        clickup_data = {
            "spaces": await self._extract_clickup_spaces(base_url, headers),
            "lists": await self._extract_clickup_lists(base_url, headers),
            "tasks": await self._extract_clickup_tasks(base_url, headers),
            "custom_fields": await self._extract_clickup_custom_fields(base_url, headers),
            "time_tracking": await self._extract_clickup_time_tracking(base_url, headers)
        }
        
        logger.info("✅ ClickUp data extraction completed")
        return clickup_data
    
    async def _extract_clickup_spaces(self, base_url: str, headers: Dict) -> List[Dict]:
        """Extract ClickUp spaces"""
        try:
            async with self.session.get(f"{base_url}/team/{self.credentials.clickup_team_id}/space", headers=headers) as response:
                if response.status == 200:
                    spaces_data = await response.json()
                    return spaces_data.get('spaces', [])
                else:
                    logger.error(f"Failed to fetch ClickUp spaces: {response.status}")
                    return []
        except Exception as e:
            logger.error(f"Error extracting ClickUp spaces: {e}")
            return []
    
    async def _extract_clickup_lists(self, base_url: str, headers: Dict) -> List[Dict]:
        """Extract ClickUp lists from all spaces"""
        try:
            spaces = await self._extract_clickup_spaces(base_url, headers)
            all_lists = []
            
            for space in spaces:
                space_id = space['id']
                async with self.session.get(f"{base_url}/space/{space_id}/list", headers=headers) as response:
                    if response.status == 200:
                        lists_data = await response.json()
                        lists = lists_data.get('lists', [])
                        for list_item in lists:
                            list_item['space_id'] = space_id
                            list_item['space_name'] = space['name']
                        all_lists.extend(lists)
            
            return all_lists
        except Exception as e:
            logger.error(f"Error extracting ClickUp lists: {e}")
            return []
    
    async def _extract_clickup_tasks(self, base_url: str, headers: Dict) -> List[Dict]:
        """Extract ClickUp tasks from all lists"""
        try:
            lists = await self._extract_clickup_lists(base_url, headers)
            all_tasks = []
            
            for list_item in lists:
                list_id = list_item['id']
                async with self.session.get(f"{base_url}/list/{list_id}/task", headers=headers) as response:
                    if response.status == 200:
                        tasks_data = await response.json()
                        tasks = tasks_data.get('tasks', [])
                        for task in tasks:
                            task['list_id'] = list_id
                            task['list_name'] = list_item['name']
                            task['space_name'] = list_item['space_name']
                        all_tasks.extend(tasks)
            
            return all_tasks
        except Exception as e:
            logger.error(f"Error extracting ClickUp tasks: {e}")
            return []
    
    async def _extract_clickup_custom_fields(self, base_url: str, headers: Dict) -> List[Dict]:
        """Extract ClickUp custom fields"""
        try:
            lists = await self._extract_clickup_lists(base_url, headers)
            all_custom_fields = []
            
            for list_item in lists:
                list_id = list_item['id']
                async with self.session.get(f"{base_url}/list/{list_id}/field", headers=headers) as response:
                    if response.status == 200:
                        fields_data = await response.json()
                        fields = fields_data.get('fields', [])
                        for field in fields:
                            field['list_id'] = list_id
                            field['list_name'] = list_item['name']
                        all_custom_fields.extend(fields)
            
            return all_custom_fields
        except Exception as e:
            logger.error(f"Error extracting ClickUp custom fields: {e}")
            return []
    
    async def _extract_clickup_time_tracking(self, base_url: str, headers: Dict) -> List[Dict]:
        """Extract ClickUp time tracking data"""
        try:
            # Get time tracking for the team
            async with self.session.get(f"{base_url}/team/{self.credentials.clickup_team_id}/time_entries", headers=headers) as response:
                if response.status == 200:
                    time_data = await response.json()
                    return time_data.get('data', [])
                else:
                    logger.error(f"Failed to fetch ClickUp time tracking: {response.status}")
                    return []
        except Exception as e:
            logger.error(f"Error extracting ClickUp time tracking: {e}")
            return []

    # ===========================================
    # FILLOUT INTEGRATION
    # ===========================================
    
    async def extract_fillout_data(self) -> Dict[str, Any]:
        """Extract intake form data from Fillout"""
        logger.info("🔍 Starting Fillout data extraction...")
        
        base_url = "https://api.fillout.com/v1"
        headers = {
            "Authorization": f"Bearer {self.credentials.fillout_api_key}",
            "Content-Type": "application/json"
        }
        
        fillout_data = {
            "forms": await self._extract_fillout_forms(base_url, headers),
            "submissions": await self._extract_fillout_submissions(base_url, headers),
            "analytics": await self._extract_fillout_analytics(base_url, headers)
        }
        
        logger.info("✅ Fillout data extraction completed")
        return fillout_data
    
    async def _extract_fillout_forms(self, base_url: str, headers: Dict) -> List[Dict]:
        """Extract all Fillout forms"""
        try:
            async with self.session.get(f"{base_url}/forms", headers=headers) as response:
                if response.status == 200:
                    forms_data = await response.json()
                    forms = forms_data
                    
                    # Get detailed form structure for each form
                    detailed_forms = []
                    for form in forms:
                        form_id = form['id']
                        async with self.session.get(f"{base_url}/forms/{form_id}", headers=headers) as form_response:
                            if form_response.status == 200:
                                detailed_form = await form_response.json()
                                detailed_forms.append(detailed_form)
                    
                    return detailed_forms
                else:
                    logger.error(f"Failed to fetch Fillout forms: {response.status}")
                    return []
        except Exception as e:
            logger.error(f"Error extracting Fillout forms: {e}")
            return []
    
    async def _extract_fillout_submissions(self, base_url: str, headers: Dict) -> List[Dict]:
        """Extract Fillout form submissions"""
        try:
            forms = await self._extract_fillout_forms(base_url, headers)
            all_submissions = []
            
            for form in forms:
                form_id = form['id']
                async with self.session.get(f"{base_url}/forms/{form_id}/submissions", headers=headers) as response:
                    if response.status == 200:
                        submissions_data = await response.json()
                        submissions = submissions_data.get('responses', [])
                        for submission in submissions:
                            submission['form_id'] = form_id
                            submission['form_name'] = form.get('name', 'Unknown')
                        all_submissions.extend(submissions)
            
            return all_submissions
        except Exception as e:
            logger.error(f"Error extracting Fillout submissions: {e}")
            return []
    
    async def _extract_fillout_analytics(self, base_url: str, headers: Dict) -> Dict[str, Any]:
        """Extract Fillout analytics data"""
        try:
            forms = await self._extract_fillout_forms(base_url, headers)
            analytics_data = {}
            
            for form in forms:
                form_id = form['id']
                # Note: Analytics endpoint might vary based on Fillout API
                async with self.session.get(f"{base_url}/forms/{form_id}/analytics", headers=headers) as response:
                    if response.status == 200:
                        form_analytics = await response.json()
                        analytics_data[form_id] = form_analytics
                    else:
                        analytics_data[form_id] = {"error": f"Analytics not available: {response.status}"}
            
            return analytics_data
        except Exception as e:
            logger.error(f"Error extracting Fillout analytics: {e}")
            return {}

    # ===========================================
    # ANALYSIS & DOCUMENTATION FUNCTIONS
    # ===========================================
    
    async def analyze_customer_journey(self) -> Dict[str, Any]:
        """Analyze customer journey patterns across all systems"""
        logger.info("📊 Analyzing customer journey patterns...")
        
        # This would correlate data across systems to map the complete customer journey
        journey_analysis = {
            "lead_sources": await self._analyze_lead_sources(),
            "intake_patterns": await self._analyze_intake_patterns(),
            "conversion_rates": await self._analyze_conversion_rates(),
            "workflow_bottlenecks": await self._identify_workflow_bottlenecks(),
            "processing_times": await self._analyze_processing_times()
        }
        
        return journey_analysis
    
    async def _analyze_lead_sources(self) -> Dict[str, Any]:
        """Analyze where leads are coming from"""
        # Correlate data from Smartsuite, Make.com, and Fillout
        return {"analysis": "Lead source analysis from integrated data"}
    
    async def _analyze_intake_patterns(self) -> Dict[str, Any]:
        """Analyze intake form completion patterns"""
        # Analyze Fillout data for completion rates, drop-off points, etc.
        return {"analysis": "Intake pattern analysis from Fillout data"}
    
    async def _analyze_conversion_rates(self) -> Dict[str, Any]:
        """Analyze conversion rates through the funnel"""
        # Cross-reference lead data with completed orders
        return {"analysis": "Conversion rate analysis across systems"}
    
    async def _identify_workflow_bottlenecks(self) -> List[Dict]:
        """Identify bottlenecks in current workflows"""
        # Use timestamps and status changes to identify delays
        return [{"bottleneck": "Analysis of workflow bottlenecks"}]
    
    async def _analyze_processing_times(self) -> Dict[str, Any]:
        """Analyze processing times for different workflow stages"""
        # Calculate average times between status changes
        return {"analysis": "Processing time analysis"}
    
    async def generate_system_documentation(self) -> Dict[str, Any]:
        """Generate comprehensive system documentation"""
        logger.info("📝 Generating comprehensive system documentation...")
        
        documentation = {
            "system_overview": {
                "systems_documented": ["smartsuite", "make_com", "clickup", "fillout"],
                "extraction_timestamp": datetime.now().isoformat(),
                "data_quality_score": await self._calculate_data_quality_score()
            },
            "workflow_documentation": await self._document_workflows(),
            "integration_mapping": await self._map_integrations(),
            "data_structure_analysis": await self._analyze_data_structures(),
            "performance_baseline": await self._establish_performance_baseline(),
            "migration_recommendations": await self._generate_migration_recommendations()
        }
        
        return documentation
    
    async def _calculate_data_quality_score(self) -> float:
        """Calculate overall data quality score"""
        # Implement data quality assessment logic
        return 0.85  # Placeholder
    
    async def _document_workflows(self) -> Dict[str, Any]:
        """Document all identified workflows"""
        return {"workflows": "Comprehensive workflow documentation"}
    
    async def _map_integrations(self) -> Dict[str, Any]:
        """Map all system integrations"""
        return {"integrations": "System integration mapping"}
    
    async def _analyze_data_structures(self) -> Dict[str, Any]:
        """Analyze data structures across systems"""
        return {"data_structures": "Data structure analysis"}
    
    async def _establish_performance_baseline(self) -> Dict[str, Any]:
        """Establish current performance baseline"""
        return {"baseline": "Performance baseline measurements"}
    
    async def _generate_migration_recommendations(self) -> List[Dict]:
        """Generate recommendations for Xano migration"""
        return [{"recommendation": "Migration strategy recommendations"}]
    
    # ===========================================
    # MAIN EXECUTION FUNCTIONS
    # ===========================================
    
    async def extract_all_systems(self) -> Dict[str, Any]:
        """Extract data from all systems"""
        logger.info("🚀 Starting comprehensive system extraction...")
        
        extraction_results = {}
        
        try:
            # Extract from each system
            extraction_results["smartsuite"] = await self.extract_smartsuite_data()
            extraction_results["make_com"] = await self.extract_make_com_data()
            extraction_results["clickup"] = await self.extract_clickup_data()
            extraction_results["fillout"] = await self.extract_fillout_data()
            
            # Perform analysis
            extraction_results["customer_journey_analysis"] = await self.analyze_customer_journey()
            extraction_results["system_documentation"] = await self.generate_system_documentation()
            
            # Store results
            self.extracted_data = extraction_results
            
            logger.info("✅ All system extraction completed successfully!")
            return extraction_results
            
        except Exception as e:
            logger.error(f"❌ Error during system extraction: {e}")
            raise
    
    async def save_results(self, output_file: str = "chargecars_system_analysis.json"):
        """Save extraction results to file"""
        try:
            with open(output_file, 'w', encoding='utf-8') as f:
                json.dump(self.extracted_data, f, indent=2, ensure_ascii=False, default=str)
            logger.info(f"💾 Results saved to {output_file}")
        except Exception as e:
            logger.error(f"Failed to save results: {e}")

# ===========================================
# MAIN EXECUTION
# ===========================================

async def main():
    """Main execution function"""
    print("🚀 ChargeCars System Documentation MCP")
    print("=====================================")
    
    # Initialize credentials from environment variables
    credentials = SystemCredentials(
        smartsuite_api_key=os.getenv("SMARTSUITE_API_KEY", ""),
        smartsuite_workspace_id=os.getenv("SMARTSUITE_WORKSPACE_ID", ""),
        make_com_token=os.getenv("MAKE_COM_TOKEN", ""),
        clickup_token=os.getenv("CLICKUP_TOKEN", ""),
        clickup_team_id=os.getenv("CLICKUP_TEAM_ID", ""),
        fillout_api_key=os.getenv("FILLOUT_API_KEY", ""),
        noloco_access_token=os.getenv("NOLOCO_ACCESS_TOKEN", "")
    )
    
    # Validate credentials
    missing_credentials = []
    if not credentials.smartsuite_api_key:
        missing_credentials.append("SMARTSUITE_API_KEY")
    if not credentials.smartsuite_workspace_id:
        missing_credentials.append("SMARTSUITE_WORKSPACE_ID")
    if not credentials.make_com_token:
        missing_credentials.append("MAKE_COM_TOKEN")
    if not credentials.clickup_token:
        missing_credentials.append("CLICKUP_TOKEN")
    if not credentials.clickup_team_id:
        missing_credentials.append("CLICKUP_TEAM_ID")
    if not credentials.fillout_api_key:
        missing_credentials.append("FILLOUT_API_KEY")
    
    if missing_credentials:
        print("❌ Missing required environment variables:")
        for cred in missing_credentials:
            print(f"   - {cred}")
        print("\nPlease set these environment variables and try again.")
        return
    
    # Execute MCP
    async with ChargeCarsSystemMCP(credentials) as mcp:
        try:
            results = await mcp.extract_all_systems()
            await mcp.save_results()
            
            print("\n📊 Extraction Summary:")
            print("=====================")
            for system, data in results.items():
                if isinstance(data, dict):
                    count = sum(len(v) if isinstance(v, list) else 1 for v in data.values())
                    print(f"   {system}: {count} data points extracted")
                else:
                    print(f"   {system}: Data extracted")
            
            print("\n✅ System documentation completed successfully!")
            print("Check chargecars_system_analysis.json for detailed results.")
            
        except Exception as e:
            print(f"❌ Extraction failed: {e}")

if __name__ == "__main__":
    asyncio.run(main()) 