import { IsString } from 'class-validator';

export class MessageSendRequestDto {
  @IsString()
  content: string;

  @IsString()
  phoneNumber: string;
}
