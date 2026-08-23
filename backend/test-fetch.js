const jwt = require('jsonwebtoken');
const token = jwt.sign({ sub: 1, email: "test@example.com", name: "Test" }, process.env.JWT_SECRET || 'fallback_secret');
fetch("http://localhost:3001/user-notifications", {
  headers: { "Authorization": `Bearer ${token}` }
}).then(async res => {
  console.log("Status:", res.status);
  const data = await res.json();
  console.dir(data, { depth: null });
}).catch(e => console.error(e));
