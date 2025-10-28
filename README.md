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

## Quick Installation (Recommended)

### Automated Setup Script

The easiest way to install the Hajjefy MCP server:

```bash
# Clone the repository
git clone https://github.com/nhajje/hajjefy-mcp-server.git
cd hajjefy-mcp-server

# Run the installation script
./install.sh
```

The script will:
1. ✅ Install dependencies
2. ✅ Build the TypeScript project
3. ✅ Create `.env` file from template
4. ✅ Generate Claude Desktop config with correct paths
5. ✅ Test the server installation

## Manual Installation

If you prefer to install manually:

### 1. Clone and Build

```bash
git clone https://github.com/nhajje/hajjefy-mcp-server.git
cd hajjefy-mcp-server
npm install
npm run build
```

### 2. Get Your Hajjefy API Token

1. Log into your [Hajjefy dashboard](https://hajjefy.com)
2. Go to Settings (admin access required)
3. Navigate to the "API Tokens" section
4. Click "Create New Token"
5. Name it "Claude Desktop MCP"
6. Copy the generated token (starts with `hjf_live_...`)

### 3. Configure Environment Variables

Create a `.env` file in the project root:

```bash
cp .env.example .env
```

Edit `.env` and add your token:

```
HAJJEFY_API_TOKEN=hjf_live_your_token_here
HAJJEFY_BASE_URL=https://hajjefy.com
```

### 4. Configure Claude Desktop

Edit your Claude Desktop configuration file:

**macOS**: `~/Library/Application Support/Claude/claude_desktop_config.json`
**Windows**: `%APPDATA%/Claude/claude_desktop_config.json`
**Linux**: `~/.config/Claude/claude_desktop_config.json`

**⚠️ IMPORTANT**: Use the **full absolute path** to the built files:

```json
{
  "mcpServers": {
    "hajjefy": {
      "command": "node",
      "args": [
        "/ABSOLUTE/PATH/TO/hajjefy-mcp-server/dist/index.js"
      ],
      "env": {
        "HAJJEFY_API_TOKEN": "hjf_live_your_token_here",
        "HAJJEFY_BASE_URL": "https://hajjefy.com"
      }
    }
  }
}
```

**Example macOS path**:
```json
"/Users/yourname/hajjefy-mcp-server/dist/index.js"
```

**Example Windows path**:
```json
"C:\\Users\\yourname\\hajjefy-mcp-server\\dist\\index.js"
```

**Example Linux path**:
```json
"/home/yourname/hajjefy-mcp-server/dist/index.js"
```

### 5. Test Installation

Before restarting Claude Desktop, test the server:

```bash
# From the hajjefy-mcp-server directory
node dist/index.js
```

If it starts without errors (waiting for input), press `Ctrl+C` and proceed.

### 6. Restart Claude Desktop

Completely quit and restart Claude Desktop to load the new MCP server.

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

### Common Installation Issues

#### ❌ "Server transport closed unexpectedly"

**Cause**: Wrong path to built files or missing environment variables.

**Solution**:
1. Verify the path in your config points to `dist/index.js` (not `build/index.js`)
2. Use **absolute paths** like `/Users/yourname/hajjefy-mcp-server/dist/index.js`
3. Check that `.env` file exists with valid `HAJJEFY_API_TOKEN`

#### ❌ "spawn hajjefy-mcp-server ENOENT"

**Cause**: Global command not installed or not in PATH.

**Solution**: Use the absolute path method instead:
```json
{
  "command": "node",
  "args": ["/ABSOLUTE/PATH/TO/hajjefy-mcp-server/dist/index.js"]
}
```

#### ❌ "HAJJEFY_API_TOKEN environment variable is required"

**Cause**: Missing or incorrect environment variable configuration.

**Solution**:
1. Create `.env` file in the project root
2. Add: `HAJJEFY_API_TOKEN=hjf_live_your_token_here`
3. Or add token to Claude Desktop config `env` section

#### ❌ Build directory not found

**Cause**: Project not built or built to wrong directory.

**Solution**:
```bash
cd hajjefy-mcp-server
npm run build
ls dist/  # Should show index.js
```

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
- **Always fully quit and restart** Claude Desktop (not just close window)
- Check Claude Desktop logs at:
  - macOS: `~/Library/Logs/Claude/`
  - Windows: `%APPDATA%/Claude/logs/`
- Verify the JSON configuration syntax is correct (no trailing commas!)
- Make sure the `mcpServers` object is properly formed

### Testing the Server Manually

To verify the server works before configuring Claude Desktop:

```bash
cd hajjefy-mcp-server
source .env  # Load environment variables
node dist/index.js
```

If it waits for input without errors, the server is working! Press `Ctrl+C` to exit.

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