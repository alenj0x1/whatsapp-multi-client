import {
  IsArray,
  IsBoolean,
  IsEnum,
  IsNotEmpty,
  IsString,
} from 'class-validator';
import { Events } from 'whatsapp-web.js';

export class ClientCreateRequestDto {
  @IsString({ each: true })
  @IsArray()
  @IsNotEmpty()
  @IsEnum(Events, { each: true })
  events: string[];

  @IsBoolean()
  init_to_start: boolean;
}
