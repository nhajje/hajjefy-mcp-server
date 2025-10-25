#!/usr/bin/env node

import { spawn } from 'child_process';

async function testSyncStatus() {
  console.log('🔍 Testing MCP Server - Sync Status');

  const serverProcess = spawn('node', ['dist/index.js'], {
    env: {
      ...process.env,
      HAJJEFY_API_TOKEN: process.env.HAJJEFY_API_TOKEN || 'hjf_live_mfvwfrqw_ca55a13db6132107259301ff9c1c320f',
      HAJJEFY_BASE_URL: process.env.HAJJEFY_BASE_URL || 'https://hajjefy.com'
    },
    stdio: ['pipe', 'pipe', 'pipe']
  });

  let responseData = '';

  serverProcess.stdout.on('data', (data) => {
    responseData += data.toString();
  });

  serverProcess.stderr.on('data', (data) => {
    console.error('Server error:', data.toString());
  });

  // Test get_sync_status
  console.log('📊 Testing: Get sync status...');
  const syncStatusRequest = {
    jsonrpc: '2.0',
    id: 1,
    method: 'tools/call',
    params: {
      name: 'get_sync_status',
      arguments: {}
    }
  };

  serverProcess.stdin.write(JSON.stringify(syncStatusRequest) + '\n');

  // Wait for response
  await new Promise(resolve => setTimeout(resolve, 3000));

  serverProcess.kill();

  console.log('📤 Server Response:');
  console.log(responseData);
}

// Run the test
testSyncStatus().catch(console.error);