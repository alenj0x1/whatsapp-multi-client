import {
  OnGatewayConnection,
  WebSocketGateway,
  WebSocketServer,
} from '@nestjs/websockets';
import { WsService } from './ws.service';
import { Server, Socket } from 'socket.io';
import { ClientEventData } from 'src/interfaces/client-event-data.interface';
import { Logger } from '@nestjs/common';

@WebSocketGateway()
export class WsGateway implements OnGatewayConnection {
  @WebSocketServer() server: Server;

  constructor(private readonly wsService: WsService) {}

  async handleConnection(client: Socket, ...args: any[]) {
    const apiKey = client.handshake.query.apiKey as string | undefined;
    const address = client.handshake.address;

    if (this.wsService.validateAddress(address)) {
      client.disconnect();
      Logger.error(
        `Client ${client.id} disconnected, not allowed address`,
        'ClientWebsocketConnection',
      );
      return;
    }

    if (!apiKey) {
      client.disconnect();
      Logger.error(
        `Client ${client.id} disconnected, missing query api key`,
        'ClientWebsocketConnection',
      );
      return;
    }

    if (!(await this.wsService.validateApiKey(apiKey))) {
      client.disconnect();
      Logger.error(
        `Client ${client.id} disconnected, not exists or expired api key`,
        'ClientWebsocketConnection',
      );
      return;
    }

    Logger.log(`Client ${client.id} connected`, 'ClientWebsocketConnection');
  }

  clientEmit<T>(eventName: string = 'events', data: ClientEventData<T>) {
    this.server.emit(eventName, data);
  }
}
