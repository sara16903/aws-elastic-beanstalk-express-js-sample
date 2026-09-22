const http = require('http');
const assert = require('assert');
const app = require('../app');

const server = app.listen(0, () => {
  const { port } = server.address();
  http.get(`http://localhost:${port}/`, (res) => {
    let data = '';
    res.on('data', chunk => data += chunk);
    res.on('end', () => {
      try {
        assert.strictEqual(res.statusCode, 200);
        assert.strictEqual(data, 'Hello World!');
        console.log('Test passed: GET / returns 200 and "Hello World!"');
        server.close(() => process.exit(0));
      } catch (err) {
        console.error('Test failed:', err.message);
        server.close(() => process.exit(1));
      }
    });
  }).on('error', (err) => {
    console.error('Request error:', err.message);
    server.close(() => process.exit(1));
  });
});
