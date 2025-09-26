import { Injectable, Logger, OnModuleInit } from '@nestjs/common';
import { WsGateway } from 'src/ws/ws.gateway';
import { Client, LocalAuth } from 'whatsapp-web.js';
import { readdir, rm } from 'fs/promises';
import * as path from 'path';

@Injectable()
export class ClientsService implements OnModuleInit {
  private readonly clients: Record<string, Client> = {};
  private readonly dataPath: string = path.join(
    __dirname,
    '..',
    '..',
    'clients',
  );

  constructor(private readonly wsGateway: WsGateway) {}

  async onModuleInit() {
    try {
      const sessions = await readdir(this.dataPath);

      for (const session of sessions) {
        const id = session.split('-')[1];
        if (!id) return;

        if (this.clients[id]) return;

        const client = await this.create(id);
        if (!client) return;

        this.clients[id] = client;
        Logger.log(`${id} loaded`, 'ClientsFirstLoad');
      }
    } catch (error) {}
  }

  async create(id: string): Promise<Client | null> {
    if (this.clients[id]) {
      return null;
    }

    const client = new Client({
      authStrategy: new LocalAuth({
        clientId: id,
        dataPath: this.dataPath,
      }),
      webVersionCache: {
        type: 'none',
      },
      puppeteer: {
        headless: true,
      },
    });

    this.clients[id] = client;

    return client;
  }

  async state(id: string) {
    const client = this.get(id);
    if (!client) return false;

    return await client.getState();
  }

  async logout(id: string): Promise<boolean> {
    const client = this.get(id);
    if (!client) return false;

    try {
      await client.logout();
      return true;
    } catch (error) {
      return false;
    }
  }

  async disconnect(id: string) {
    const client = this.get(id);
    if (!client) return false;

    try {
      await client.destroy();
      return true;
    } catch (error) {
      return false;
    }
  }

  async remove(id: string): Promise<boolean> {
    const client = this.get(id);
    if (!client) return false;

    try {
      await client.logout();
      await client.destroy();
    } catch (error) {}

    try {
      await rm(path.join(this.dataPath, `session-${id}`), {
        recursive: true,
        force: true,
      });
    } catch (error) {
      console.log(error);
    }

    delete this.clients[id];

    return true;
  }

  get(id: string): Client | null {
    return this.clients[id] || null;
  }

  subscribe(id: string, events: string[]): string[] {
    const client = this.get(id);
    if (!client) return [];

    const filteredEvents = events.filter(
      (x) => !client.eventNames().includes(x),
    );

    for (const event of filteredEvents) {
      client.on(event, (data) => {
        this.wsGateway.clientEmit('events', {
          name: event,
          clientId: id,
          data,
        });
      });
    }

    return filteredEvents;
  }

  unsubscribe(id: string, events: string[]): string[] {
    const client = this.get(id);
    if (!client) return [];

    const filteredEvents = events.filter((x) =>
      client.eventNames().includes(x),
    );

    for (const event of filteredEvents) {
      client.off(event, () => {
        this.wsGateway.clientEmit('events', {
          name: 'unsubscribed',
          clientId: id,
          data: null,
        });
      });
    }

    return filteredEvents;
  }
}
