import { IsArray, IsEnum, IsNotEmpty } from 'class-validator';
import { Events } from 'whatsapp-web.js';

export class ManagerSubscribeRequestDto {
  @IsArray()
  @IsNotEmpty({ each: true })
  @IsEnum(Events, { each: true })
  events: string[];
}
