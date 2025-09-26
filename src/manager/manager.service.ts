import { BadRequestException, Injectable } from '@nestjs/common';
import { ManagerSubscribeRequestDto } from 'src/dtos/requests/manager/manager-subscribe-request.dto';
import { ClientsService } from 'src/services/clients/clients.service';

@Injectable()
export class ManagerService {
  constructor(private readonly clients: ClientsService) {}

  async create(id: string) {
    const client = await this.clients.create(id);
    if (!client) {
      return new BadRequestException('El cliente fue previamente creado');
    }

    return id;
  }

  async init(id: string) {
    const client = this.getClient(id);
    await client.initialize();

    return true;
  }

  subscribe(id: string, payload: ManagerSubscribeRequestDto) {
    this.getClient(id);
    return this.clients.subscribe(id, payload.events);
  }

  unsubscribe(id: string, payload: ManagerSubscribeRequestDto) {
    this.getClient(id);
    return this.clients.unsubscribe(id, payload.events);
  }

  async state(id: string) {
    this.getClient(id);
    return await this.clients.state(id);
  }

  disconnect(id: string) {
    this.getClient(id);
    return this.clients.disconnect(id);
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
