#!/usr/bin/env node

import { spawn } from 'child_process';

// Test the new user customer allocation functionality
async function testUserAllocation() {
  console.log('🧪 Testing Hajjefy MCP Server - User Customer Allocation');

  const serverProcess = spawn('node', ['dist/index.js'], {
    env: {
      ...process.env,
      HAJJEFY_API_TOKEN: process.env.HAJJEFY_API_TOKEN || 'hjf_live_test',
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

  // Test 1: List available tools
  console.log('📋 Testing: List available tools...');
  const listToolsRequest = {
    jsonrpc: '2.0',
    id: 1,
    method: 'tools/list',
    params: {}
  };

  serverProcess.stdin.write(JSON.stringify(listToolsRequest) + '\n');

  // Wait a bit for response
  await new Promise(resolve => setTimeout(resolve, 1000));

  // Test 2: Call the new user customer allocation tool
  console.log('👤 Testing: Get user customer allocation...');
  const userAllocationRequest = {
    jsonrpc: '2.0',
    id: 2,
    method: 'tools/call',
    params: {
      name: 'get_user_customer_allocation',
      arguments: {
        username: 'Nadim Hajje',
        days: 30
      }
    }
  };

  serverProcess.stdin.write(JSON.stringify(userAllocationRequest) + '\n');

  // Wait for response
  await new Promise(resolve => setTimeout(resolve, 2000));

  serverProcess.kill();

  console.log('📤 Server Response:');
  console.log(responseData);
}

// Run the test
testUserAllocation().catch(console.error);