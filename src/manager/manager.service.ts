import {
  BadRequestException,
  Injectable,
  Logger,
  NotFoundException,
} from '@nestjs/common';
import { ClientsService } from 'src/clients/clients.service';
import { ClientCreateRequestDto } from 'src/dtos/requests/clients/client-create-request.dto';
import { ClientUpdateRequestDto } from 'src/dtos/requests/clients/client-update-request.dto';
import { MessageSendRequestDto } from 'src/dtos/requests/messages/message-send-request.dto';
import { QueueStatus } from 'src/enums/queue-status.enum';
import { PrismaMongoService } from 'src/services/prisma-mongo/prisma-mongo.service';

@Injectable()
export class ManagerService {
  constructor(
    private readonly clients: ClientsService,
    private readonly mgdb: PrismaMongoService,
  ) {}

  async create(id: string, payload: ClientCreateRequestDto) {
    const client = await this.clients.create(id, payload);
    if (!client) {
      return new BadRequestException('El cliente fue previamente creado');
    }

    return id;
  }

  async update(id: string, payload: ClientUpdateRequestDto) {
    const client = await this.clients.update(id, payload);
    if (!client) {
      return new BadRequestException('El cliente no existe');
    }

    return id;
  }

  logout(id: string) {
    this.getClient(id);
    return this.clients.logout(id);
  }

  async remove(id: string) {
    this.getClient(id);
    return await this.clients.remove(id);
  }

  private getClient(id: string) {
    const client = this.clients.get(id);
    if (!client) {
      throw new BadRequestException('El cliente no existe');
    }

    return client;
  }
}
