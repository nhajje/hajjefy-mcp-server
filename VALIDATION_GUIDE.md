# MCP Server Validation Guide

## ✅ Automated Test Results
The automated tests show:
- **API Connectivity**: ✅ WORKING - Successfully authenticated and retrieved data
- **MCP Protocol**: ✅ WORKING - All 5 tools registered and functional
- **Data Quality**: ✅ WORKING - Real production data (57K+ worklogs)

## Method 1: Run Automated Tests

```bash
# In the hajjefy-mcp-server directory
node test-mcp.js
```

## Method 2: Manual Claude Desktop Testing

### Step 1: Install the MCP Server Globally
```bash
cd /Users/nadimhajje/hajjefy-mcp-server
npm install -g .
```

### Step 2: Configure Claude Desktop

Edit your Claude Desktop config file:
- **macOS**: `~/Library/Application Support/Claude/claude_desktop_config.json`
- **Windows**: `%APPDATA%/Claude/claude_desktop_config.json`

Add this configuration:
```json
{
  "mcpServers": {
    "hajjefy": {
      "command": "hajjefy-mcp-server",
      "env": {
        "HAJJEFY_API_TOKEN": "hjf_live_mfvwfrqw_ca55a13db6132107259301ff9c1c320f",
        "HAJJEFY_BASE_URL": "https://hajjefy.com"
      }
    }
  }
}
```

### Step 3: Test in Claude Desktop

Restart Claude Desktop and try these prompts:

1. **Basic Summary**: *"Show me this week's time tracking summary"*
2. **Team Analysis**: *"How is our team performing this month?"*
3. **Export Data**: *"Export the last 7 days of data as CSV"*
4. **Project Insights**: *"What are our top projects by hours?"*

### Step 4: Validate Responses

You should see responses like:
```
# Time Tracking Summary (2025-09-16 to 2025-09-23)

## Overall Statistics
- **Total Hours**: 624.58 hours
- **Total Entries**: 501 worklogs
- **Active Days**: 8 days
- **Average Hours/Day**: 78.07 hours

## Top Accounts
1. **DHLBILL**: 155.75h (24.9%)
2. **INTERNAL**: 152.67h (24.4%)
[...]
```

## Method 3: Tool-by-Tool Testing

### Test Individual Tools:

```bash
# Test each tool with the automated script
node test-mcp.js
```

**Expected Results:**
- ✅ `get_time_summary` - Returns formatted time overview
- ✅ `get_user_analytics` - Returns user-specific insights
- ✅ `get_team_overview` - Returns team performance data
- ✅ `get_billable_analysis` - Returns revenue insights
- ✅ `export_data` - Returns data in JSON/CSV format

## Method 4: Error Testing

### Test Authentication:
```bash
# Test with invalid token
HAJJEFY_API_TOKEN="invalid_token" node test-mcp.js
```
**Expected**: Should show authentication error

### Test Network Issues:
```bash
# Test with invalid URL
HAJJEFY_BASE_URL="https://invalid.domain" node test-mcp.js
```
**Expected**: Should show connection error

## ✅ Success Indicators

Your MCP server is working correctly if:

1. **Automated tests pass** ✅
2. **Claude Desktop shows the server as connected** ✅
3. **Natural language queries return rich, formatted data** ✅
4. **All 5 tools are available and functional** ✅
5. **Real-time data is being retrieved from hajjefy.com** ✅

## 🚨 Troubleshooting

### Common Issues:
- **"Authentication failed"** → Check API token is correct and active
- **"Connection refused"** → Verify HAJJEFY_BASE_URL is correct
- **"Tool not found"** → Restart Claude Desktop after config changes
- **"No data returned"** → Check if your Hajjefy account has time tracking data

### Debug Commands:
```bash
# Check environment variables
echo $HAJJEFY_API_TOKEN
echo $HAJJEFY_BASE_URL

# Test API directly
curl -H "Authorization: Bearer $HAJJEFY_API_TOKEN" https://hajjefy.com/api/health

# Check MCP server logs
hajjefy-mcp-server 2>&1 | tee mcp-debug.log
```

## 🎯 Next Steps

Once validation passes:
1. **Share with team members** - They can install and use the same setup
2. **Publish to npm** - Make it available via `npm install -g hajjefy-mcp-server`
3. **Create GitHub repository** - Share the source code publicly
4. **Add more tools** - Extend functionality based on user feedback