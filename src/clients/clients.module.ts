import { Module } from '@nestjs/common';
import { ClientsService } from './clients.service';
import { WsGateway } from 'src/ws/ws.gateway';
import { WsService } from 'src/ws/ws.service';
import { PrismaMongoService } from 'src/services/prisma-mongo/prisma-mongo.service';

@Module({
  controllers: [],
  providers: [ClientsService, WsGateway, WsService, PrismaMongoService],
  exports: [ClientsService],
})
export class ClientsModule {}
