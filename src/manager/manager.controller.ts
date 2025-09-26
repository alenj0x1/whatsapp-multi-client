import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  ParseBoolPipe,
  Post,
  Put,
  Query,
} from '@nestjs/common';
import { ManagerService } from './manager.service';
import { ManagerSubscribeRequestDto } from 'src/dtos/requests/manager/manager-subscribe-request.dto';

@Controller('manager')
export class ManagerController {
  constructor(private readonly managerService: ManagerService) {}

  @Post('create/:id')
  create(@Param('id') id: string) {
    return this.managerService.create(id);
  }

  @Get('state/:id')
  state(@Param('id') id: string) {
    return this.managerService.state(id);
  }

  @Put('subscribe/:id')
  subscribe(
    @Param('id') id: string,
    @Body() payload: ManagerSubscribeRequestDto,
  ) {
    return this.managerService.subscribe(id, payload);
  }

  @Put('unsubscribe/:id')
  unsubscribe(
    @Param('id') id: string,
    @Body() payload: ManagerSubscribeRequestDto,
  ) {
    return this.managerService.subscribe(id, payload);
  }

  @Put('init/:id')
  init(@Param('id') id: string) {
    return this.managerService.init(id);
  }

  @Put('disconnect/:id')
  disconnect(@Param('id') id: string) {
    return this.managerService.disconnect(id);
  }

  @Put('logout/:id')
  logout(@Param('id') id: string) {
    return this.managerService.logout(id);
  }

  @Delete('remove/:id')
  remove(@Param('id') id: string) {
    return this.managerService.remove(id);
  }
}
