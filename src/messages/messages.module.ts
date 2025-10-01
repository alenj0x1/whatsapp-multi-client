import { Module } from '@nestjs/common';
import { MessagesService } from './messages.service';
import { MessagesController } from './messages.controller';
import { ClientsModule } from 'src/clients/clients.module';
import { PrismaMongoService } from 'src/services/prisma-mongo/prisma-mongo.service';

@Module({
  imports: [ClientsModule],
  controllers: [MessagesController],
  providers: [MessagesService, PrismaMongoService],
})
export class MessagesModule {}
