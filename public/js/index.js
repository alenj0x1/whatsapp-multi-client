const socket = io('http://localhost:3000');

const clients = {};

socket.on('events', ({ clientId, name, data }) => {
  if (!clients[clientId]) {
    clients[clientId] = {
      clientId: clientId,
      connected: false,
      qr: null,
    };
  }

  if (name === 'qr') {
    clients[clientId] = {
      clientId: clientId,
      connected: false,
      qr: data,
    };
  }

  if (name === 'ready') {
    clients[clientId] = {
      clientId: clientId,
      connected: true,
      qr: null,
    };
  }

  console.log(clients);
});
