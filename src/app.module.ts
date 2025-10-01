import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { ManagerModule } from './manager/manager.module';
import { WsModule } from './ws/ws.module';
import { WsService } from './ws/ws.service';
import { WsGateway } from './ws/ws.gateway';
import { AppController } from './app.controller';
import { PrismaMongoService } from './services/prisma-mongo/prisma-mongo.service';
import { QueueStatus } from './enums/queue-status.enum';
import { ClientsModule } from './clients/clients.module';
import { ClientsService } from './clients/clients.service';
import { Environments } from './enums/environments.enum';
import { MessagesModule } from './messages/messages.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      envFilePath: '.env',
    }),
    ManagerModule,
    WsModule,
    ClientsModule,
    MessagesModule,
  ],
  controllers: [AppController],
  providers: [WsGateway, WsService, PrismaMongoService],
})
export class AppModule {
  constructor(
    private readonly clients: ClientsService,
    private readonly mgdb: PrismaMongoService,
    private readonly config: ConfigService,
  ) {
    (async () => {
      setInterval(
        async () => {
          const fromHistory: string[] = [];

          for (const queue of await mgdb.queue.findMany({
            where: {
              status: QueueStatus.WITHOUT_SEND,
            },
          })) {
            const dataClient = this.clients.get(queue.client_id);
            if (!dataClient) return;

            if (fromHistory.includes(queue.from)) return;

            const { client } = dataClient;

            try {
              await client.sendMessage(`${queue.to}@c.us`, queue.content);

              await this.mgdb.queue.update({
                where: {
                  id: queue.id,
                },
                data: {
                  status: QueueStatus.SENDED,
                },
              });

              fromHistory.push(queue.from);
            } catch (error) {
              await this.mgdb.queue.update({
                where: {
                  id: queue.id,
                },
                data: {
                  status: QueueStatus.SENDED,
                },
              });
            }
          }
        },
        1000 * this.config.get(Environments.QUEUE_TIME_IN_SECONDS, 5),
      );
    })();
  }
}
