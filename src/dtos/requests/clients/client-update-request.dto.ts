import {
  IsArray,
  IsBoolean,
  IsEnum,
  IsNotEmpty,
  IsOptional,
  IsString,
} from 'class-validator';
import { Events } from 'whatsapp-web.js';

export class ClientUpdateRequestDto {
  @IsOptional()
  @IsString({ each: true })
  @IsArray()
  @IsEnum(Events, { each: true })
  events?: string[];

  @IsOptional()
  @IsBoolean()
  init_to_start?: boolean;
}
