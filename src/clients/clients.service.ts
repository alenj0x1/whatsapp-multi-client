import { Injectable, Logger } from '@nestjs/common';
import { WsGateway } from 'src/ws/ws.gateway';
import { Client, LocalAuth } from 'whatsapp-web.js';
import { rm } from 'fs/promises';
import * as path from 'path';
import { IClientData } from 'src/interfaces/client-data.interface';
import { PrismaMongoService } from '../services/prisma-mongo/prisma-mongo.service';
import { ClientCreateRequestDto } from 'src/dtos/requests/clients/client-create-request.dto';
import { ClientUpdateRequestDto } from 'src/dtos/requests/clients/client-update-request.dto';

@Injectable()
export class ClientsService {
  public readonly clients: Record<string, IClientData> = {};
  private readonly dataPath: string = path.join(
    __dirname,
    '..',
    '..',
    'clients',
  );

  constructor(
    private readonly wsGateway: WsGateway,
    private readonly mgdb: PrismaMongoService,
  ) {
    (async () => {
      await this.initClients();
    })();
  }

  async create(
    id: string,
    payload: ClientCreateRequestDto,
  ): Promise<IClientData | null> {
    try {
      if (this.clients[id]) {
        return null;
      }

      if (await this.mgdb.client.findFirst({ where: { client_id: id } })) {
        return null;
      }

      const client = this.createClientOnly(id);
      if (!client) return null;

      await this.mgdb.client.create({
        data: {
          client_id: id,
          events: payload.events,
          init_to_start: payload.init_to_start,
        },
      });

      this.clients[id] = {
        client: client,
        connected: false,
      };

      this.subscribe(id, payload.events);
      await client.initialize();

      return this.clients[id];
    } catch (error) {
      Logger.error(error, 'ClientsService:create');
      return null;
    }
  }

  async update(
    id: string,
    payload: ClientUpdateRequestDto,
  ): Promise<IClientData | null> {
    try {
      const dbClient = await this.mgdb.client.findFirst({
        where: {
          client_id: id,
        },
      });
      if (!dbClient) return null;

      const client = this.get(id);
      if (!client) return null;

      if (payload.events) {
        dbClient.events = payload.events;
      }

      if (payload.init_to_start) {
        dbClient.init_to_start = payload.init_to_start;
      }

      await this.mgdb.client.update({
        where: {
          id: dbClient.id,
        },
        data: {
          events: dbClient.events,
          init_to_start: dbClient.init_to_start,
        },
      });

      try {
        await client.client.destroy();
      } catch (error) {}

      await this.initClient(dbClient);

      return client;
    } catch (error) {
      Logger.error(error, 'ClientsService:update');
      return null;
    }
  }

  async logout(id: string): Promise<boolean> {
    const clientData = this.get(id);
    if (!clientData) return false;

    const { client, connected } = clientData;
    if (!connected) return false;

    try {
      await client.logout();
      return true;
    } catch (error) {
      Logger.error(error, 'ClientsService:logout');
      return false;
    }
  }

  async disconnect(id: string) {
    const clientData = this.get(id);
    if (!clientData) return false;

    const { client } = clientData;

    try {
      await client.destroy();
      return true;
    } catch (error) {
      Logger.error(error, 'ClientsService:disconnect');
      return false;
    }
  }

  async remove(id: string): Promise<boolean> {
    try {
      const clientData = this.get(id);
      if (!clientData) return false;

      const { client } = clientData;

      const dbClient = await this.mgdb.client.findFirst({
        where: {
          client_id: id,
        },
      });
      if (!dbClient) return false;

      try {
        await client.destroy();
      } catch (error) {}

      try {
        await client.logout();
      } catch (error) {}

      try {
        await rm(path.join(this.dataPath, `session-${id}`), {
          recursive: true,
          force: true,
        });
      } catch (error) {}

      await this.mgdb.client.delete({
        where: {
          id: dbClient.id,
        },
      });

      delete this.clients[id];

      return true;
    } catch (error) {
      Logger.error(error, 'ClientsService:remove');
      return false;
    }
  }

  get(id: string): IClientData | null {
    return this.clients[id] || null;
  }

  subscribe(id: string, events: string[]): string[] {
    try {
      const clientData = this.get(id);
      if (!clientData) return [];

      const { client, connected } = clientData;

      const filteredEvents = events.filter(
        (x) => !client.eventNames().includes(x),
      );

      for (const event of filteredEvents) {
        client.on(event, (data) => {
          let connectionState = connected;

          if (event === 'ready') {
            connectionState = true;

            this.clients[id] = {
              client,
              connected: connectionState,
            };
          }

          this.wsGateway.clientEmit('events', {
            name: event,
            clientId: id,
            connected: connectionState,
            data,
          });
        });
      }

      return filteredEvents;
    } catch (error) {
      Logger.error(error, 'ClientsService:subscribe');
      return [];
    }
  }

  unsubscribe(id: string, events: string[]): string[] {
    try {
      const clientData = this.get(id);
      if (!clientData) return [];

      const { client, connected } = clientData;

      const filteredEvents = events.filter((x) =>
        client.eventNames().includes(x),
      );

      for (const event of filteredEvents) {
        client.off(event, () => {
          this.wsGateway.clientEmit('events', {
            name: 'unsubscribed',
            clientId: id,
            connected: connected,
            data: null,
          });
        });
      }

      return filteredEvents;
    } catch (error) {
      Logger.error(error, 'ClientsService:unsubscribe');
      return [];
    }
  }

  private createClientOnly(id: string) {
    try {
      return new Client({
        authStrategy: new LocalAuth({
          clientId: id,
          dataPath: this.dataPath,
        }),
        webVersionCache: {
          type: 'local',
        },
        puppeteer: {
          headless: true,
        },
      });
    } catch (error) {
      Logger.error(error, 'ClientsService:CreateClientOnly');
      return null;
    }
  }

  private async initClient(client: {
    id: string;
    client_id: string;
    events: string[];
    init_to_start: boolean;
    created_at: Date;
  }) {
    try {
      const create = this.createClientOnly(client.client_id);
      if (!create) return null;

      this.clients[client.client_id] = {
        client: create,
        connected: false,
      };

      if (client.events.length > 0) {
        this.subscribe(client.client_id, client.events);
        Logger.log(
          `Subscribed events [${client.events.join(', ')}] to client: ${client.client_id}`,
          'ClientLoader',
        );
      }

      if (client.init_to_start) {
        await create.initialize();
        Logger.log(`Initialized client: ${client.client_id}`, 'ClientLoader');
      }

      Logger.log(`Instanced client: ${client.client_id}`, 'ClientLoader');
    } catch (error) {
      Logger.error(error, 'ClientsService:initClient');
    }
  }

  private async initClients() {
    try {
      const clients = await this.mgdb.client.findMany({});

      for (const client of clients) {
        await this.initClient(client);
      }
    } catch (error) {
      Logger.error(error, 'ClientsService:initClients');
    }
  }
}
