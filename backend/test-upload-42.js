const jwt = require('jsonwebtoken');
const token = jwt.sign({ sub: 42, email: 'test@example.com' }, 'fallback_secret', { expiresIn: '1h' });
fetch('http://localhost:3001/files', {
  method: 'POST',
  headers: { "Authorization": `Bearer ${token}`, "Content-Type": "application/json" },
  body: JSON.stringify({
    name: "test.png",
    size: 1024,
    type: "image/png",
    storageKey: "dummy-key"
  })
}).then(res => res.text()).then(console.log).catch(console.error);
