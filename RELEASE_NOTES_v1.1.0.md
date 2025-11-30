# Release Notes - Version 1.1.0

**Release Date:** November 30, 2025

## What's New

### 🎯 Enhanced Salesforce Integration with Intelligent Name Matching

The biggest improvement in v1.1.0 is **automatic name variation matching** for Salesforce lookups. The MCP server now intelligently converts account codes to company names, dramatically improving match success rates.

#### How It Works

When you query customer analysis with an account code like "THOMSONREU", the server now:

1. **Tries the original name**: "THOMSONREU"
2. **Converts to formatted name**: "Thomsonreu"
3. **Extracts company prefix**: "Thomson" (first 7 characters)
4. **Tests each variation** until a Salesforce match is found

This means queries like:
```
Get full customer analysis for 'THOMSONREU' including Salesforce data
```

Now automatically find and display the complete Salesforce account information for "Thomson Reuters Corp" without requiring the exact company name!

### 📊 What Salesforce Data You Get

When a match is found, you'll see:
- **Account Owner** & **CS Owner**
- **Industry** & **Account Type**
- **Account Health Score**
- **Annual Recurring Revenue (ARR)**
- **Next Renewal Date**
- **Support Cases** (total and open)
- **Product Information**
- **Support Package Tier**
- And more!

### 🐛 Fixes

- Fixed axios interceptor to preserve error response objects for proper 404 handling
- Improved error logging for better debugging
- Enhanced fuzzy matching with 60% confidence threshold

## Installation

### For New Users

```bash
# Clone and install
git clone https://github.com/nhajje/hajjefy-mcp-server.git
cd hajjefy-mcp-server
./install.sh
```

### For Existing Users - Updating from v1.0.x

```bash
# Pull latest changes
cd hajjefy-mcp-server
git pull origin main

# Rebuild
npm install
npm run build

# Restart Claude Desktop (fully quit and reopen)
```

Your existing configuration will continue to work - no changes needed!

## GitHub Release

✅ **Code pushed to GitHub**: https://github.com/nhajje/hajjefy-mcp-server
✅ **Tagged as v1.1.0**: Available in releases
✅ **README updated** with latest improvements
✅ **CHANGELOG created** for version tracking

## NPM Package Status

📦 **Package Ready**: The package is built and ready for npm publication

**Package Details:**
- Name: `hajjefy-mcp-server`
- Version: `1.1.0`
- Size: 38.5 KB (179.4 KB unpacked)
- Includes: Built code, README, CHANGELOG, install script, validation script

### To Publish to NPM (When Ready)

Since you don't have npm login configured yet, here's how to publish:

```bash
# 1. Create npm account (if needed)
#    Go to https://www.npmjs.com/signup

# 2. Login to npm
npm login

# 3. Publish the package
npm publish
```

**Note:** For now, installation works perfectly via GitHub (recommended method in README). Publishing to npm is optional and would allow users to install via:
```bash
npm install -g hajjefy-mcp-server
```

## Installation Methods

### Current (Recommended): GitHub Installation
```bash
git clone https://github.com/nhajje/hajjefy-mcp-server.git
cd hajjefy-mcp-server
./install.sh
```

### Future Option: NPM Installation (After Publishing)
```bash
npm install -g hajjefy-mcp-server
```

## Documentation Updates

✅ **README.md**: Updated with intelligent name matching details
✅ **CHANGELOG.md**: Created with version history
✅ **Installation Guide**: Complete instructions for both methods
✅ **Troubleshooting**: Enhanced with common issues and solutions

## What's Next

1. **Optional**: Publish to npm for easier installation
2. **Monitor**: GitHub issues for user feedback
3. **Enhance**: Continue improving Salesforce matching algorithms based on usage patterns

## Support

- **GitHub Issues**: https://github.com/nhajje/hajjefy-mcp-server/issues
- **Documentation**: See README.md for detailed usage instructions
- **Installation Help**: Use automated `install.sh` script or follow manual installation guide

---

**Thank you for using Hajjefy MCP Server! 🚀**
