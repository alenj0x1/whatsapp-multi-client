import { Body, Controller, Param, Post } from '@nestjs/common';
import { MessagesService } from './messages.service';
import { MessageSendRequestDto } from 'src/dtos/requests/messages/message-send-request.dto';

@Controller('messages')
export class MessagesController {
  constructor(private readonly messagesService: MessagesService) {}

  @Post('send/:id')
  send(@Param('id') id: string, @Body() payload: MessageSendRequestDto) {
    return this.messagesService.send(id, payload);
  }
}
