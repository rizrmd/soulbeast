// Simple WebSocket test script
const WebSocket = require('ws');

const ws = new WebSocket('ws://localhost:3001');

ws.on('open', function open() {
  console.log('✅ WebSocket connection opened successfully');
  
  // Send a test message
  const testMessage = {
    type: 'PING',
    data: {},
    timestamp: Date.now()
  };
  
  ws.send(JSON.stringify(testMessage));
  console.log('📤 Sent test message:', testMessage);
});

ws.on('message', function message(data) {
  console.log('📥 Received message:', data.toString());
});

ws.on('close', function close(code, reason) {
  console.log('❌ WebSocket connection closed');
  console.log('Code:', code);
  console.log('Reason:', reason.toString());
});

ws.on('error', function error(err) {
  console.error('💥 WebSocket error:', err.message);
});

// Close connection after 5 seconds
setTimeout(() => {
  console.log('🔚 Closing connection...');
  ws.close();
}, 5000);