import { Client } from 'whatsapp-web.js';

export interface IClientData {
  client: Client;
  connected: boolean;
}
