import { Body, Controller, Delete, Param, Post, Put } from '@nestjs/common';
import { ManagerService } from './manager.service';
import { ClientCreateRequestDto } from 'src/dtos/requests/clients/client-create-request.dto';
import { ClientUpdateRequestDto } from 'src/dtos/requests/clients/client-update-request.dto';

@Controller('manager')
export class ManagerController {
  constructor(private readonly managerService: ManagerService) {}

  @Post('create/:id')
  create(@Param('id') id: string, @Body() payload: ClientCreateRequestDto) {
    return this.managerService.create(id, payload);
  }

  @Put('update/:id')
  update(@Param('id') id: string, @Body() payload: ClientUpdateRequestDto) {
    return this.managerService.update(id, payload);
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
