import { IsArray, IsEnum, IsNotEmpty } from 'class-validator';
import { ClientEvent } from 'src/enums/client-event.enum';

export class ManagerSubscribeRequestDto {
  @IsArray()
  @IsNotEmpty({ each: true })
  @IsEnum(ClientEvent, { each: true })
  events: string[];
}
