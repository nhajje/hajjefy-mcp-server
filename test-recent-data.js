#!/usr/bin/env node

import { spawn } from 'child_process';

async function testRecentData() {
  console.log('📅 Testing MCP Server - Recent October Data');

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

  // Test get_daily_hours for last 7 days to see October data
  console.log('📊 Testing: Get daily hours for last 7 days...');
  const dailyHoursRequest = {
    jsonrpc: '2.0',
    id: 1,
    method: 'tools/call',
    params: {
      name: 'get_daily_hours',
      arguments: {
        days: 7,
        include_projects: false,
        include_worklogs: false,
        include_trends: false,
        include_per_user: false
      }
    }
  };

  serverProcess.stdin.write(JSON.stringify(dailyHoursRequest) + '\n');

  // Wait for response
  await new Promise(resolve => setTimeout(resolve, 3000));

  serverProcess.kill();

  console.log('📤 Server Response:');
  console.log(responseData);
}

// Run the test
testRecentData().catch(console.error);