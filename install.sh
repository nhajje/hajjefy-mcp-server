#!/bin/bash

# Hajjefy MCP Server Installation Script
# This script sets up the MCP server for Claude Desktop

set -e  # Exit on error

echo "🚀 Hajjefy MCP Server Installation"
echo "===================================="
echo ""

# Check if we're in the right directory
if [ ! -f "package.json" ]; then
    echo "❌ Error: package.json not found. Please run this script from the hajjefy-mcp-server directory."
    exit 1
fi

# Step 1: Install dependencies
echo "📦 Step 1: Installing dependencies..."
npm install
echo "✅ Dependencies installed"
echo ""

# Step 2: Build the project
echo "🔨 Step 2: Building TypeScript project..."
npm run build
echo "✅ Build complete (output in dist/ directory)"
echo ""

# Step 3: Check if .env exists
if [ ! -f ".env" ]; then
    echo "⚠️  No .env file found. Creating from template..."
    cp .env.example .env
    echo "✅ Created .env file"
    echo "⚠️  IMPORTANT: Edit .env and add your HAJJEFY_API_TOKEN"
    echo ""
else
    echo "✅ .env file exists"
    echo ""
fi

# Step 4: Get the absolute path
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
NODE_PATH="$(which node)"

echo "📝 Step 3: Configuration"
echo "========================"
echo ""
echo "Your Claude Desktop config should look like this:"
echo ""
echo "{"
echo "  \"mcpServers\": {"
echo "    \"hajjefy\": {"
echo "      \"command\": \"$NODE_PATH\","
echo "      \"args\": ["
echo "        \"$SCRIPT_DIR/dist/index.js\""
echo "      ],"
echo "      \"env\": {"
echo "        \"HAJJEFY_API_TOKEN\": \"your_token_here\","
echo "        \"HAJJEFY_BASE_URL\": \"https://hajjefy.com\""
echo "      }"
echo "    }"
echo "  }"
echo "}"
echo ""

# Detect OS and show config location
if [[ "$OSTYPE" == "darwin"* ]]; then
    CONFIG_PATH="$HOME/Library/Application Support/Claude/claude_desktop_config.json"
    echo "📍 Claude Desktop config location (macOS):"
    echo "   $CONFIG_PATH"
elif [[ "$OSTYPE" == "linux-gnu"* ]]; then
    CONFIG_PATH="$HOME/.config/Claude/claude_desktop_config.json"
    echo "📍 Claude Desktop config location (Linux):"
    echo "   $CONFIG_PATH"
elif [[ "$OSTYPE" == "msys" ]] || [[ "$OSTYPE" == "win32" ]]; then
    CONFIG_PATH="%APPDATA%/Claude/claude_desktop_config.json"
    echo "📍 Claude Desktop config location (Windows):"
    echo "   $CONFIG_PATH"
fi
echo ""

# Step 5: Offer to test
echo "🧪 Step 4: Test Installation"
echo "============================="
echo ""
read -p "Would you like to test the server? (y/n): " -n 1 -r
echo ""
if [[ $REPLY =~ ^[Yy]$ ]]; then
    echo "Testing server (press Ctrl+C to stop)..."
    echo "If you see no errors, the server is working!"
    echo ""
    if [ -f ".env" ]; then
        set -a
        source .env
        set +a
    fi
    node dist/index.js &
    SERVER_PID=$!
    sleep 2

    if ps -p $SERVER_PID > /dev/null; then
        echo "✅ Server started successfully (PID: $SERVER_PID)"
        echo "Stopping test server..."
        kill $SERVER_PID 2>/dev/null || true
    else
        echo "❌ Server failed to start. Check your .env file."
        exit 1
    fi
fi

echo ""
echo "✅ Installation Complete!"
echo ""
echo "📋 Next Steps:"
echo "   1. Edit .env and add your HAJJEFY_API_TOKEN"
echo "   2. Copy the config above to: $CONFIG_PATH"
echo "   3. Restart Claude Desktop"
echo "   4. Ask Claude: 'Can you give me an overview of Hajjefy?'"
echo ""
echo "🎉 Happy time tracking!"
