require('dotenv').config();
const jwt = require('jsonwebtoken');
const token = jwt.sign({ sub: 4, email: "test@test.com" }, process.env.JWT_SECRET, { expiresIn: '1h' });
fetch('http://localhost:3000/files/9/download-url', {
  headers: { 'Authorization': 'Bearer ' + token }
}).then(res => {
  console.log("STATUS:", res.status);
  return res.text();
}).then(console.log).catch(console.error);
