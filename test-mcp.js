#!/usr/bin/env node

import { spawn } from 'child_process';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Test MCP server by sending JSON-RPC messages
async function testMCPServer() {
  console.log('🧪 Testing Hajjefy MCP Server...\n');

  const serverPath = join(__dirname, 'dist', 'index.js');
  const server = spawn('node', [serverPath], {
    stdio: ['pipe', 'pipe', 'pipe'],
    env: { ...process.env }
  });

  let responseBuffer = '';

  server.stdout.on('data', (data) => {
    responseBuffer += data.toString();
  });

  server.stderr.on('data', (data) => {
    console.error('Server stderr:', data.toString());
  });

  // Wait for server to initialize
  await new Promise(resolve => setTimeout(resolve, 1000));

  console.log('1️⃣ Testing server initialization...');

  // Test 1: Initialize
  const initMessage = {
    jsonrpc: '2.0',
    id: 1,
    method: 'initialize',
    params: {
      protocolVersion: '2024-11-05',
      capabilities: {},
      clientInfo: {
        name: 'test-client',
        version: '1.0.0'
      }
    }
  };

  server.stdin.write(JSON.stringify(initMessage) + '\n');

  // Wait for response
  await new Promise(resolve => setTimeout(resolve, 500));

  console.log('2️⃣ Testing tools list...');

  // Test 2: List Tools
  const listToolsMessage = {
    jsonrpc: '2.0',
    id: 2,
    method: 'tools/list',
    params: {}
  };

  server.stdin.write(JSON.stringify(listToolsMessage) + '\n');

  // Wait for response
  await new Promise(resolve => setTimeout(resolve, 500));

  console.log('3️⃣ Testing get_time_summary tool...');

  // Test 3: Call get_time_summary tool
  const callToolMessage = {
    jsonrpc: '2.0',
    id: 3,
    method: 'tools/call',
    params: {
      name: 'get_time_summary',
      arguments: {
        days: 7
      }
    }
  };

  server.stdin.write(JSON.stringify(callToolMessage) + '\n');

  // Wait for final response
  await new Promise(resolve => setTimeout(resolve, 2000));

  // Close server
  server.kill();

  console.log('\n📋 Server Responses:');
  console.log(responseBuffer);

  return responseBuffer;
}

// Test API connectivity separately
async function testAPIConnectivity() {
  console.log('\n🔗 Testing API Connectivity...\n');

  try {
    const { HajjefyApiClient } = await import('./dist/hajjefy-client.js');

    const client = new HajjefyApiClient(
      process.env.HAJJEFY_BASE_URL || 'https://hajjefy.com',
      process.env.HAJJEFY_API_TOKEN
    );

    console.log('1️⃣ Testing health endpoint...');
    const health = await client.getHealthStatus();
    console.log('✅ Health check:', health.status || 'OK');

    console.log('\n2️⃣ Testing dashboard overview...');
    const overview = await client.getDashboardOverview(7);
    console.log('✅ Dashboard data received:');
    console.log(`   - Date range: ${overview.dateRange.from} to ${overview.dateRange.to}`);
    console.log(`   - Total hours: ${overview.totals.hours}`);
    console.log(`   - Total entries: ${overview.totals.entries}`);
    console.log(`   - Top account: ${overview.topAccounts[0]?.account} (${overview.topAccounts[0]?.total_hours}h)`);

    return true;
  } catch (error) {
    console.error('❌ API Test Failed:', error.message);
    return false;
  }
}

// Run tests
async function runAllTests() {
  console.log('🚀 Hajjefy MCP Server Validation\n');
  console.log('=' .repeat(50));

  // Test API connectivity first
  const apiWorking = await testAPIConnectivity();

  if (!apiWorking) {
    console.log('\n⚠️  API connectivity issues detected. MCP server may have limited functionality.');
    console.log('Please check your HAJJEFY_API_TOKEN and HAJJEFY_BASE_URL environment variables.\n');
  }

  // Test MCP server
  console.log('\n' + '='.repeat(50));
  await testMCPServer();

  console.log('\n' + '='.repeat(50));
  console.log('🏁 Validation Complete!');

  if (apiWorking) {
    console.log('✅ MCP server is ready for use with Claude Desktop');
  } else {
    console.log('⚠️  Check your API configuration before using with Claude Desktop');
  }
}

runAllTests().catch(console.error);