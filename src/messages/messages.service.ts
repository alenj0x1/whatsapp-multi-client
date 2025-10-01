import {
  BadRequestException,
  Injectable,
  Logger,
  NotFoundException,
} from '@nestjs/common';
import { ClientsService } from 'src/clients/clients.service';
import { MessageSendRequestDto } from 'src/dtos/requests/messages/message-send-request.dto';
import { QueueStatus } from 'src/enums/queue-status.enum';
import { PrismaMongoService } from 'src/services/prisma-mongo/prisma-mongo.service';

@Injectable()
export class MessagesService {
  constructor(
    private readonly clients: ClientsService,
    private readonly mgdb: PrismaMongoService,
  ) {}

  async send(id: string, payload: MessageSendRequestDto) {
    const clientData = this.clients.get(id);
    if (!clientData)
      return new NotFoundException('El cliente que argumentó no existe');

    const { client } = clientData;

    try {
      await this.mgdb.queue.create({
        data: {
          client_id: id,
          from: client.info.wid.user,
          to: payload.phoneNumber,
          content: payload.content,
          status: QueueStatus.WITHOUT_SEND,
        },
      });

      return true;
    } catch (error) {
      Logger.error(error);
      return new BadRequestException(
        'No se pudo guardar el mensaje para su posterior envío',
      );
    }
  }
}
