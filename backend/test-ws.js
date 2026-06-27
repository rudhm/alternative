const WebSocket = require('ws');
const ws = new WebSocket('wss://rudhasi.mooo.com/ws?token=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOiJIYXNpIiwiaWF0IjoxNzgyMTM0Njk4fQ.IaWujkW3KLdubK5Ijqywr8UD-LSXIeUtI7FE65mddio');

ws.on('open', () => {
  console.log("Connected to WS!");
  ws.send(JSON.stringify({
    type: "chat",
    payload: {
      id: "12345678-1234-1234-1234-123456789012",
      content: "Test WS connection",
      media: []
    }
  }));
});

ws.on('message', (data) => {
  console.log("Received:", data.toString());
  setTimeout(() => process.exit(0), 1000);
});

ws.on('error', console.error);
ws.on('close', () => console.log("Closed"));
