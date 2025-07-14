const assert = require('assert');
const ioClient = require('socket.io-client');
const http = require('http');
const app = require('../server');
const { attachSocket } = require('../server');

const server = http.createServer(app);
attachSocket(server);
server.listen(0, () => {
  const port = server.address().port;
  const socket = ioClient(`http://localhost:${port}`);
  socket.on('connect', () => {
    socket.close();
    server.close(() => console.log('Socket.IO connection test passed'));
  });
  socket.on('connect_error', err => {
    server.close(() => { throw err; });
  });
});
