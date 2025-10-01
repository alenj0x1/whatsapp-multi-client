import { Module } from '@nestjs/common';
import { WsService } from './ws.service';
import { WsGateway } from './ws.gateway';
import { PrismaMongoService } from 'src/services/prisma-mongo/prisma-mongo.service';

@Module({
  providers: [WsGateway, WsService, PrismaMongoService],
})
export class WsModule {}
