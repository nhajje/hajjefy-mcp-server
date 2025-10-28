#!/usr/bin/env node

/**
 * Hajjefy MCP Server Setup Validation
 *
 * This script validates your installation and configuration
 */

const fs = require('fs');
const path = require('path');
const os = require('os');

console.log('🔍 Hajjefy MCP Server Setup Validation\n');
console.log('========================================\n');

let hasErrors = false;
let hasWarnings = false;

// 1. Check if dist/ directory exists
console.log('✓ Checking build directory...');
const distPath = path.join(__dirname, 'dist');
if (!fs.existsSync(distPath)) {
  console.error('  ❌ ERROR: dist/ directory not found');
  console.error('     Run: npm run build');
  hasErrors = true;
} else {
  console.log('  ✅ dist/ directory exists');
}

// 2. Check if dist/index.js exists
console.log('\n✓ Checking compiled files...');
const indexPath = path.join(__dirname, 'dist', 'index.js');
if (!fs.existsSync(indexPath)) {
  console.error('  ❌ ERROR: dist/index.js not found');
  console.error('     Run: npm run build');
  hasErrors = true;
} else {
  console.log('  ✅ dist/index.js exists');

  // Check if it's executable
  const content = fs.readFileSync(indexPath, 'utf8');
  if (content.startsWith('#!/usr/bin/env node')) {
    console.log('  ✅ File has proper shebang');
  }
}

// 3. Check .env file
console.log('\n✓ Checking environment configuration...');
const envPath = path.join(__dirname, '.env');
if (!fs.existsSync(envPath)) {
  console.warn('  ⚠️  WARNING: .env file not found');
  console.warn('     Create .env file or set environment variables in Claude Desktop config');
  hasWarnings = true;
} else {
  console.log('  ✅ .env file exists');

  // Check if it has required variables
  const envContent = fs.readFileSync(envPath, 'utf8');

  if (!envContent.includes('HAJJEFY_API_TOKEN=')) {
    console.error('  ❌ ERROR: HAJJEFY_API_TOKEN not found in .env');
    hasErrors = true;
  } else if (envContent.includes('HAJJEFY_API_TOKEN=hjf_live_your_token_here') ||
             envContent.includes('HAJJEFY_API_TOKEN=your_token_here')) {
    console.warn('  ⚠️  WARNING: HAJJEFY_API_TOKEN still has placeholder value');
    console.warn('     Update .env with your actual API token');
    hasWarnings = true;
  } else {
    console.log('  ✅ HAJJEFY_API_TOKEN is configured');
  }

  if (envContent.includes('HAJJEFY_BASE_URL=')) {
    console.log('  ✅ HAJJEFY_BASE_URL is configured');
  }
}

// 4. Check Claude Desktop config
console.log('\n✓ Checking Claude Desktop configuration...');
let configPath;
const platform = os.platform();

if (platform === 'darwin') {
  configPath = path.join(os.homedir(), 'Library', 'Application Support', 'Claude', 'claude_desktop_config.json');
} else if (platform === 'win32') {
  configPath = path.join(process.env.APPDATA || '', 'Claude', 'claude_desktop_config.json');
} else if (platform === 'linux') {
  configPath = path.join(os.homedir(), '.config', 'Claude', 'claude_desktop_config.json');
}

if (!fs.existsSync(configPath)) {
  console.warn('  ⚠️  WARNING: Claude Desktop config not found at:');
  console.warn(`     ${configPath}`);
  console.warn('     You need to create this file manually');
  hasWarnings = true;
} else {
  console.log('  ✅ Claude Desktop config exists');

  try {
    const configContent = fs.readFileSync(configPath, 'utf8');
    const config = JSON.parse(configContent);

    if (!config.mcpServers || !config.mcpServers.hajjefy) {
      console.warn('  ⚠️  WARNING: "hajjefy" server not found in config');
      console.warn('     Add hajjefy configuration to claude_desktop_config.json');
      hasWarnings = true;
    } else {
      const hajjefyConfig = config.mcpServers.hajjefy;
      console.log('  ✅ Hajjefy MCP server configured');

      // Check command configuration
      if (hajjefyConfig.command === 'hajjefy-mcp-server') {
        console.warn('  ⚠️  WARNING: Using global command "hajjefy-mcp-server"');
        console.warn('     Consider using absolute path with "node" command instead');
        hasWarnings = true;
      } else if (hajjefyConfig.command === 'node') {
        console.log('  ✅ Using node command (recommended)');

        if (hajjefyConfig.args && hajjefyConfig.args.length > 0) {
          const scriptPath = hajjefyConfig.args[0];

          // Check if path contains 'build' instead of 'dist'
          if (scriptPath.includes('/build/')) {
            console.error('  ❌ ERROR: Config references /build/ directory');
            console.error('     Should be /dist/ instead');
            console.error(`     Current: ${scriptPath}`);
            console.error(`     Should be: ${scriptPath.replace('/build/', '/dist/')}`);
            hasErrors = true;
          } else if (scriptPath.includes('/dist/')) {
            console.log('  ✅ Using correct /dist/ directory');

            // Check if it's absolute path
            if (path.isAbsolute(scriptPath)) {
              console.log('  ✅ Using absolute path (recommended)');

              // Check if file exists
              if (fs.existsSync(scriptPath)) {
                console.log('  ✅ Script file exists at configured path');
              } else {
                console.error('  ❌ ERROR: Script file not found at:');
                console.error(`     ${scriptPath}`);
                hasErrors = true;
              }
            } else {
              console.warn('  ⚠️  WARNING: Using relative path');
              console.warn('     Absolute paths are more reliable');
              hasWarnings = true;
            }
          }
        }
      }

      // Check environment variables in config
      if (!hajjefyConfig.env || !hajjefyConfig.env.HAJJEFY_API_TOKEN) {
        if (!fs.existsSync(envPath)) {
          console.error('  ❌ ERROR: HAJJEFY_API_TOKEN not in config and no .env file');
          hasErrors = true;
        } else {
          console.log('  ✅ Will load HAJJEFY_API_TOKEN from .env file');
        }
      } else if (hajjefyConfig.env.HAJJEFY_API_TOKEN.includes('your_token_here')) {
        console.warn('  ⚠️  WARNING: HAJJEFY_API_TOKEN in config has placeholder value');
        hasWarnings = true;
      } else {
        console.log('  ✅ HAJJEFY_API_TOKEN configured in Claude Desktop config');
      }
    }
  } catch (error) {
    console.error('  ❌ ERROR: Failed to parse Claude Desktop config');
    console.error(`     ${error.message}`);
    hasErrors = true;
  }
}

// 5. Check Node.js version
console.log('\n✓ Checking Node.js version...');
const nodeVersion = process.version;
const majorVersion = parseInt(nodeVersion.slice(1).split('.')[0]);

if (majorVersion < 18) {
  console.warn(`  ⚠️  WARNING: Node.js ${nodeVersion} detected`);
  console.warn('     Node.js 18+ recommended for best compatibility');
  hasWarnings = true;
} else {
  console.log(`  ✅ Node.js ${nodeVersion} (compatible)`);
}

// Summary
console.log('\n========================================');
console.log('Validation Summary\n');

if (hasErrors) {
  console.error('❌ ERRORS FOUND - Installation incomplete');
  console.log('\nPlease fix the errors above before using the MCP server.');
  process.exit(1);
} else if (hasWarnings) {
  console.warn('⚠️  WARNINGS - Installation may work but has issues');
  console.log('\nThe MCP server might work, but consider addressing the warnings above.');
  process.exit(0);
} else {
  console.log('✅ ALL CHECKS PASSED - Installation looks good!');
  console.log('\nNext steps:');
  console.log('1. Restart Claude Desktop');
  console.log('2. Ask Claude: "Can you give me an overview of Hajjefy?"');
  console.log('3. Start analyzing your time tracking data!');
  process.exit(0);
}
