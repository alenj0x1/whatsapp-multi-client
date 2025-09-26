import { Module } from '@nestjs/common';
import { ClientsService } from './services/clients/clients.service';
import { ConfigModule } from '@nestjs/config';
import { ManagerModule } from './manager/manager.module';
import { WsModule } from './ws/ws.module';
import { WsService } from './ws/ws.service';
import { WsGateway } from './ws/ws.gateway';
import { AppController } from './app.controller';

@Module({
  imports: [
    ConfigModule.forRoot({
      envFilePath: '.env',
    }),
    ManagerModule,
    WsModule,
  ],
  controllers: [AppController],
  providers: [ClientsService, WsGateway, WsService],
})
export class AppModule {}
