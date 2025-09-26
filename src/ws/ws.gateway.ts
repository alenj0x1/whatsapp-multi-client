import { WebSocketGateway, WebSocketServer } from '@nestjs/websockets';
import { WsService } from './ws.service';
import { Server } from 'socket.io';
import { ClientEventData } from 'src/interfaces/client-event-data.interface';

@WebSocketGateway()
export class WsGateway {
  @WebSocketServer() server: Server;

  constructor(private readonly wsService: WsService) {}

  clientEmit<T>(eventName: string = 'events', data: ClientEventData<T>) {
    this.server.emit(eventName, data);
  }
}
