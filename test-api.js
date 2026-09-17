import http from 'http';
const options = {
  hostname: 'localhost',
  port: 3001,
  path: '/files',
  method: 'GET',
};
const req = http.request(options, res => {
  let data = '';
  res.on('data', chunk => data += chunk);
  res.on('end', () => console.log('STATUS:', res.statusCode, 'DATA:', data));
});
req.on('error', e => console.error(e));
req.end();
