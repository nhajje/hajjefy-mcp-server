#!/usr/bin/env node

import { spawn } from 'child_process';

async function testCustomerAnalysis() {
  console.log('🧪 Testing Customer Analysis for RelateCare...\n');

  const server = spawn('node', ['dist/index.js'], {
    stdio: ['pipe', 'pipe', 'pipe'],
    env: {
      ...process.env,
      HAJJEFY_API_TOKEN: 'hjf_live_mfvwfrqw_ca55a13db6132107259301ff9c1c320f',
      HAJJEFY_BASE_URL: 'https://hajjefy.com'
    }
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

  // Initialize
  const initMessage = {
    jsonrpc: '2.0',
    id: 1,
    method: 'initialize',
    params: {
      protocolVersion: '2024-11-05',
      capabilities: {},
      clientInfo: { name: 'test-client', version: '1.0.0' }
    }
  };

  server.stdin.write(JSON.stringify(initMessage) + '\n');
  await new Promise(resolve => setTimeout(resolve, 500));

  // Test Customer Analysis for RelateCare
  console.log('Testing get_customer_analysis for RelateCare (60 days)...\n');
  
  const customerAnalysisMessage = {
    jsonrpc: '2.0',
    id: 2,
    method: 'tools/call',
    params: {
      name: 'get_customer_analysis',
      arguments: {
        customer: 'RelateCare',
        days: 60
      }
    }
  };

  server.stdin.write(JSON.stringify(customerAnalysisMessage) + '\n');

  // Wait for response
  await new Promise(resolve => setTimeout(resolve, 3000));

  // Close server
  server.kill();

  console.log('📋 Customer Analysis Response:');
  
  // Parse and format the response
  const responses = responseBuffer.trim().split('\n');
  for (const response of responses) {
    if (response.trim()) {
      try {
        const parsed = JSON.parse(response);
        if (parsed.id === 2 && parsed.result) {
          console.log(parsed.result.content[0].text);
          
          // Check if we found the expected aggregated hours
          const text = parsed.result.content[0].text;
          if (text.includes('Total Hours') && text.includes('RelateCare')) {
            const totalHoursMatch = text.match(/Total Hours[:\s]*(\d+\.?\d*)\s*hours/i);
            const billableHoursMatch = text.match(/Billable Hours[:\s]*(\d+\.?\d*)\s*hours/i);
            
            if (totalHoursMatch) {
              const totalHours = parseFloat(totalHoursMatch[1]);
              console.log(`\n✅ Found Total Hours: ${totalHours}h`);
              
              if (totalHours > 200) {
                console.log('✅ SUCCESS: Total hours appear to be aggregated across multiple accounts!');
              } else {
                console.log('❌ ISSUE: Total hours seem low - might not be aggregating all accounts');
              }
            }
            
            if (billableHoursMatch) {
              const billableHours = parseFloat(billableHoursMatch[1]);
              console.log(`✅ Found Billable Hours: ${billableHours}h`);
              
              if (Math.abs(billableHours - 109.75) < 5) {
                console.log('✅ SUCCESS: Billable hours match expected Tempo.io data (~109.75h)!');
              }
            }
          }
        }
      } catch (e) {
        // Skip non-JSON responses
      }
    }
  }
}

testCustomerAnalysis().catch(console.error);
