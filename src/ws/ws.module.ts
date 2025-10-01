import { Module } from '@nestjs/common';
import { WsService } from './ws.service';
import { WsGateway } from './ws.gateway';
import { PrismaMongoService } from 'src/services/prisma-mongo/prisma-mongo.service';
import { ConfigService } from '@nestjs/config';

@Module({
  providers: [WsGateway, WsService, PrismaMongoService, ConfigService],
})
export class WsModule {}
