import { Injectable } from '@nestjs/common';
import { PrismaMongoService } from 'src/services/prisma-mongo/prisma-mongo.service';

@Injectable()
export class WsService {
  constructor(private readonly mgdb: PrismaMongoService) {}

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
}
