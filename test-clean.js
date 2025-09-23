#!/usr/bin/env node

import { spawn } from 'child_process';

console.log('🧪 Testing clean MCP server output...\n');

// Set environment variables
const env = {
  ...process.env,
  HAJJEFY_API_TOKEN: 'hjf_live_mfvwfrqw_ca55a13db6132107259301ff9c1c320f',
  HAJJEFY_BASE_URL: 'https://hajjefy.com'
};

const server = spawn('hajjefy-mcp-server', [], {
  stdio: ['pipe', 'pipe', 'pipe'],
  env
});

let stdout = '';
let stderr = '';

server.stdout.on('data', (data) => {
  stdout += data.toString();
});

server.stderr.on('data', (data) => {
  stderr += data.toString();
});

// Send initialization message
const initMessage = {
  jsonrpc: '2.0',
  id: 1,
  method: 'initialize',
  params: {
    protocolVersion: '2024-11-05',
    capabilities: {},
    clientInfo: { name: 'test', version: '1.0.0' }
  }
};

server.stdin.write(JSON.stringify(initMessage) + '\n');

setTimeout(() => {
  server.kill();

  console.log('📤 STDOUT (should be clean JSON):');
  console.log(stdout || '(no output)');

  console.log('\n📥 STDERR (should be empty or minimal):');
  console.log(stderr || '(no output)');

  // Test if stdout is valid JSON
  if (stdout.trim()) {
    try {
      JSON.parse(stdout.trim());
      console.log('\n✅ OUTPUT IS CLEAN JSON - Claude Desktop should work!');
    } catch (e) {
      console.log('\n❌ OUTPUT IS NOT CLEAN JSON - needs fixing');
      console.log('Parse error:', e.message);
    }
  }
}, 2000);