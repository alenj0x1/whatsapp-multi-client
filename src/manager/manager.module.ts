import { Module } from '@nestjs/common';
import { ManagerService } from './manager.service';
import { ManagerController } from './manager.controller';
import { ConfigService } from '@nestjs/config';
import { WsGateway } from 'src/ws/ws.gateway';
import { WsService } from 'src/ws/ws.service';
import { PrismaMongoService } from 'src/services/prisma-mongo/prisma-mongo.service';
import { ClientsModule } from 'src/clients/clients.module';

@Module({
  imports: [ClientsModule],
  controllers: [ManagerController],
  providers: [
    ManagerService,
    ConfigService,
    WsGateway,
    WsService,
    PrismaMongoService,
  ],
})
export class ManagerModule {}
