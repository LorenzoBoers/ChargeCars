# ChargeCars MCP Setup Instructions

## Prerequisites
- Python 3.8 or higher
- API access to all systems (Smartsuite, Make.com, ClickUp, Fillout)

## Installation

### 1. Install Dependencies
```bash
pip install -r requirements.txt
```

### 2. Set Environment Variables
Create a `.env` file or set these environment variables:

```bash
# Smartsuite API Credentials
export SMARTSUITE_API_KEY="d99cf9b32aeaa64bdebb86e05da1d50e951246d6"
export SMARTSUITE_WORKSPACE_ID="suhw2iz6"

# Make.com API Credentials  
export MAKE_COM_TOKEN="c837f61e-75b9-4d76-9e72-58953fe8c348"

# ClickUp API Credentials
export CLICKUP_TOKEN="pk_38199608_RWBKIFPYH9LSP1DAR6ZLNJD2ZQP5IY4T"
export CLICKUP_TEAM_ID="20122951"

# Fillout API Credentials
export FILLOUT_API_KEY="sk_prod_Ot4xSgrEy4m7l6SaZLDt1RNahth2Gc9aZ7mgLh3X6Os20E5cpj2rJ9u9a6tc04l0d9OoxXe24PEFMSO4duOQOgKefGwDfoa6MCt_21956"

# Optional: Noloco (if API available)
export NOLOCO_ACCESS_TOKEN="eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOjEsImVtYWlsIjoibG9yZW56b0BjaGFyZ2VjYXJzLm5sIiwicHJvamVjdCI6ImNoYXJnZWNhcnMiLCJ0eXBlIjoiQVBJIiwiaWF0IjoxNzQ4MzMxMDc1fQ.-Ykj_XRQdQfx3x3PgqTakhWnzNtowSahcFhwUaNwhfk"
```

## Getting API Credentials

### Smartsuite
1. Go to Smartsuite Settings → API Access
2. Generate API key
3. Note your Workspace ID from the URL

### Make.com
1. Go to Make.com → Profile → API
2. Generate API token
3. Ensure token has scenario read permissions

### ClickUp
1. Go to ClickUp → Settings → Apps
2. Generate API token
3. Get Team ID from your workspace URL

### Fillout
1. Go to Fillout → Settings → API
2. Generate API key
3. Ensure forms read permissions

## Running the MCP

### Basic Usage
```bash
python chargecars_mcp.py
```

### With Environment File
```bash
# Create .env file with your credentials
python -c "from dotenv import load_dotenv; load_dotenv()" && python chargecars_mcp.py
```

## What You Need to Provide

To run the MCP successfully, I need you to provide:

### 1. **Smartsuite Credentials**
- API Key from Smartsuite settings
- Workspace ID (visible in URL when logged in)

### 2. **Make.com Token**
- API token with scenario read permissions
- Should include access to:
  - Scenarios list
  - Scenario blueprints
  - Execution history
  - Connections

### 3. **ClickUp Credentials**
- API token with workspace access
- Team ID (from workspace URL)

### 4. **Fillout API Key**
- API key with forms read access
- Should include access to:
  - Forms list
  - Form submissions
  - Form analytics (if available)

## Expected Output

The MCP will generate:

### 1. **JSON Data File**: `chargecars_system_analysis.json`
Complete extraction results with:
- All system data
- Workflow analysis
- Customer journey mapping
- Performance metrics
- Migration recommendations

### 2. **Console Output**
- Progress updates during extraction
- Summary of data extracted per system
- Error messages if any APIs fail
- Success confirmation

## Troubleshooting

### Common Issues

**Authentication Errors:**
- Verify API credentials are correct
- Check token permissions
- Ensure workspace/team IDs are accurate

**Rate Limiting:**
- Script includes built-in delays
- Some APIs may require additional throttling

**Missing Data:**
- Some APIs may not expose all desired endpoints
- Script will log warnings for inaccessible data
- Extraction continues for available data

### API Limitations

**Smartsuite:**
- Automation API may be limited
- Some internal data may not be accessible

**Make.com:**
- Blueprint extraction depends on API version
- Historical data may be limited

**ClickUp:**
- Time tracking requires specific permissions
- Some custom fields may not be accessible

**Fillout:**
- Analytics endpoint availability varies
- Form submission limits may apply

## Next Steps After Running MCP

1. **Review Results**: Check `chargecars_system_analysis.json`
2. **Validate Data**: Compare extracted data with manual knowledge
3. **Identify Gaps**: Note any missing or incomplete data
4. **Plan Migration**: Use results to plan Xano migration
5. **Update PRD**: Incorporate findings into PRD documentation

## Security Notes

- Never commit API credentials to version control
- Use environment variables or secure credential storage
- API tokens should have minimal required permissions
- Consider rotating tokens after extraction

---

**Ready to run?** Just provide the API credentials and execute the script! 

$env:SMARTSUITE_API_KEY="your_api_key"
$env:SMARTSUITE_WORKSPACE_ID="your_workspace_id"
$env:MAKE_COM_TOKEN="your_make_token"
$env:CLICKUP_TOKEN="your_clickup_token"
$env:CLICKUP_TEAM_ID="your_team_id"
$env:FILLOUT_API_KEY="your_fillout_key"

python chargecars_mcp.py 