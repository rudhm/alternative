const jwt = require('jsonwebtoken');

const token = jwt.sign(
  { id: 'Rudh', username: 'Rudh' },
  '350e20a49b499f9e0d45cc6cf17d444cadd6028e6380a9236ff827013fa7aa9ab0d7c597141488c8e4285ffcd97f3007a2b59a1d2d3e479b05a0660aac7d2830'
);

const WebSocket = require('ws');
const ws = new WebSocket('wss://rudhasi.mooo.com');

ws.on('open', () => {
  ws.send(JSON.stringify({ type: 'auth', token }));
});

ws.on('message', (data) => {
  const msg = JSON.parse(data);
  if (msg.type === 'auth_success') {
    console.log("Auth success. Sending message...");
    ws.send(JSON.stringify({
      type: 'chat',
      payload: {
        id: 'test-msg-123',
        content: 'Hello World',
        authorId: 'Rudh',
        folderId: 'main-folder-id',
        createdAt: new Date().toISOString()
      }
    }));
    setTimeout(() => {
      fetch("https://rudhasi.mooo.com/api/messages?folderId=main-folder-id", {
        headers: { "Authorization": `Bearer ${token}` }
      }).then(res => res.json()).then(data => {
        console.log("Fetched messages:", data);
        process.exit(0);
      });
    }, 1000);
  } else if (msg.type === 'error') {
    console.error("WS error:", msg);
    process.exit(1);
  }
});
