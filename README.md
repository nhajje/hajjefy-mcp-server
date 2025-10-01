# Hajjefy MCP Server

A Model Context Protocol (MCP) server that provides Claude with access to Hajjefy time tracking analytics and insights.

## Features

- **Time Tracking Summary**: Get comprehensive overviews of time spent across projects
- **User Analytics**: Analyze individual user performance and productivity
- **Team Overview**: View team-wide performance metrics and rankings
- **Billable Analysis**: Track billable vs non-billable hours and revenue insights
- **Customer Analysis**: Deep dive into customer-specific metrics and project breakdowns
- **Capacity Analysis**: Team workload distribution and utilization rates
- **Daily Hours Breakdown**: Comprehensive daily activity with trends and patterns
- **Sync Status**: Data freshness and synchronization information
- **Data Export**: Export time tracking data in JSON or CSV formats

## Installation

### Option 1: Install from npm (when published)
```bash
npm install -g hajjefy-mcp-server
```

### Option 2: Install from source
```bash
git clone https://github.com/yourusername/hajjefy-mcp-server
cd hajjefy-mcp-server
npm install
npm run build
```

## Setup

### 1. Get Your Hajjefy API Token

1. Log into your [Hajjefy dashboard](https://hajjefy.com)
2. Go to Settings (admin access required)
3. Navigate to the "API Tokens" section
4. Click "Create New Token"
5. Name it "Claude Desktop MCP"
6. Select scopes: `tempo:read`, `analytics:read`
7. Copy the generated token (starts with `hjf_live_...`)

### 2. Configure Claude Desktop

Edit your Claude Desktop configuration file:

**macOS**: `~/Library/Application Support/Claude/claude_desktop_config.json`
**Windows**: `%APPDATA%/Claude/claude_desktop_config.json`

Add the following configuration:

```json
{
  "mcpServers": {
    "hajjefy": {
      "command": "hajjefy-mcp-server",
      "env": {
        "HAJJEFY_API_TOKEN": "hjf_live_your_token_here",
        "HAJJEFY_BASE_URL": "https://hajjefy.com"
      }
    }
  }
}
```

### 3. Restart Claude Desktop

Restart Claude Desktop to load the new MCP server.

## Usage

Once configured, you can ask Claude questions about your time tracking data:

- *"Show me this week's time tracking summary"*
- *"What are our top projects by hours this month?"*
- *"Export the last 30 days of data as CSV"*
- *"How is our team performing compared to last month?"*
- *"Show me billable vs non-billable hours breakdown"*

## Available Tools

### `get_time_summary`
Get comprehensive time tracking overview for a specified period.

**Parameters:**
- `days` (optional): Number of days to analyze (1-365, default: 30)
- `from_date` (optional): Start date in YYYY-MM-DD format
- `to_date` (optional): End date in YYYY-MM-DD format

### `get_user_analytics`
Get detailed analytics for a specific user.

**Parameters:**
- `username` (required): Username to analyze
- `days` (optional): Number of days to analyze (1-365, default: 30)

### `get_team_overview`
Get team performance overview and rankings.

**Parameters:**
- `days` (optional): Number of days to analyze (1-365, default: 30)

### `get_billable_analysis`
Get billable hours analysis and revenue insights.

**Parameters:**
- `days` (optional): Number of days to analyze (1-365, default: 30)
- `from_date` (optional): Start date in YYYY-MM-DD format
- `to_date` (optional): End date in YYYY-MM-DD format

### `export_data`
Export time tracking data in various formats.

**Parameters:**
- `format` (optional): Export format - "json" or "csv" (default: "json")
- `days` (optional): Number of days to export (1-365, default: 30)
- `include_details` (optional): Include detailed worklog entries (default: false)

## Environment Variables

- `HAJJEFY_API_TOKEN` (required): Your Hajjefy API token
- `HAJJEFY_BASE_URL` (optional): Hajjefy base URL (default: "https://hajjefy.com")

## Troubleshooting

### Authentication Issues
- Verify your `HAJJEFY_API_TOKEN` is correct and not expired
- Ensure the token has the required scopes (`tempo:read`, `analytics:read`)
- Check that your token starts with `hjf_live_`

### Connection Issues
- Verify `HAJJEFY_BASE_URL` is correct (default: "https://hajjefy.com")
- Check your internet connection
- Ensure Hajjefy services are operational

### Permission Issues
- Make sure your API token has the necessary permissions
- Contact your Hajjefy admin if you need additional access

### Claude Desktop Issues
- Restart Claude Desktop after configuration changes
- Check Claude Desktop logs for MCP server errors
- Verify the JSON configuration syntax is correct

## Development

```bash
# Install dependencies
npm install

# Run in development mode
npm run dev

# Build for production
npm run build

# Run built version
npm run start
```

## Support

For issues related to:
- **MCP Server**: Open an issue on this repository
- **Hajjefy Platform**: Contact Hajjefy support
- **Claude Desktop**: Check Anthropic's Claude Desktop documentation

## License

MIT License - see LICENSE file for details.