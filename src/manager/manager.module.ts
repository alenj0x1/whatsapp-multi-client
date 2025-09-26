import { Module } from '@nestjs/common';
import { ManagerService } from './manager.service';
import { ManagerController } from './manager.controller';
import { ClientsService } from 'src/services/clients/clients.service';
import { ConfigService } from '@nestjs/config';
import { WsGateway } from 'src/ws/ws.gateway';
import { WsService } from 'src/ws/ws.service';

@Module({
  controllers: [ManagerController],
  providers: [
    ManagerService,
    ClientsService,
    ConfigService,
    WsGateway,
    WsService,
  ],
})
export class ManagerModule {}
