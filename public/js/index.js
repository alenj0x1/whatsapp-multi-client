const socket = io('http://localhost:3000');
const clients = {};

socket.on('events', (data) => {
  const getClient = clients[data.clientId];
  if (!getClient) {
    clients[data.clientId] = {
      clientId: data.clientId,
      connected: data.connected,
      events: [data],
      qr: data.name === 'qr' ? data.data : null,
    };

    renderClients();
    return;
  }

  console.log(getClient);

  clients[getClient.clientId] = {
    clientId: getClient.clientId,
    connected: data.connected,
    events: [...getClient.events, data],
    qr: data.name === 'qr' ? data.data : getClient.qr,
  };

  renderClients();
});

function renderClients() {
  const container = document.getElementById('clients-container');

  container.innerHTML = '';

  for (const clientId of Object.keys(clients)) {
    const client = clients[clientId];

    const clientDiv = document.createElement('div');
    clientDiv.classList.add('client');

    const nameSpan = document.createElement('span');
    nameSpan.classList.add('client-name');
    nameSpan.textContent = clientId;

    const statusSpan = document.createElement('span');
    statusSpan.classList.add(
      'status',
      `status-${client.connected ? 'connected' : 'disconnected'}`,
    );
    statusSpan.textContent = client.connected ? 'Conectado' : 'Desconectado';

    const qrDiv = document.createElement('div');
    qrDiv.id = `qr-${clientId}`;

    const table = document.createElement('table');
    table.classList.add('client-event');

    const thead = document.createElement('thead');
    thead.innerHTML = '<th>Nombre</th><th>Datos</th>';
    table.appendChild(thead);

    const tbody = document.createElement('tbody');
    client.events.forEach((event) => {
      const row = document.createElement('tr');
      const nameCell = document.createElement('td');
      nameCell.textContent = event.name;
      const dataCell = document.createElement('td');
      dataCell.textContent =
        event.name === 'qr' ? 'generated' : !event.data ? '-' : event.data;
      row.appendChild(nameCell);
      row.appendChild(dataCell);
      tbody.appendChild(row);
    });
    table.appendChild(tbody);

    clientDiv.appendChild(nameSpan);
    clientDiv.appendChild(statusSpan);
    clientDiv.appendChild(qrDiv);
    clientDiv.appendChild(table);

    container.appendChild(clientDiv);

    new QRCode(qrDiv, client.qr);
  }
}
