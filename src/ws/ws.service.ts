import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Environments } from 'src/enums/environments.enum';
import { PrismaMongoService } from 'src/services/prisma-mongo/prisma-mongo.service';

@Injectable()
export class WsService {
  constructor(
    private readonly mgdb: PrismaMongoService,
    private readonly config: ConfigService,
  ) {}

  async validateApiKey(apiKey: string) {
    const data = await this.mgdb.apiKey.findFirst({
      where: {
        value: apiKey,
      },
    });
    if (!data) return false;

    if (data.expiration < new Date()) {
      return false;
    }

    return true;
  }

  validateAddress(address: string) {
    const environ = this.config.get<string | null>(
      Environments.WEBSOCKET_ALLOWED_ADDRESSES,
    );
    if (!environ) return false;

    const allowedAddresses = environ.split(',');

    if (!allowedAddresses.includes(address)) {
      return false;
    }

    return true;
  }
}
