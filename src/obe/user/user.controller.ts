import { Controller, Get, Request } from '@nestjs/common';
import { UserService } from './user.service';

@Controller('/user')
export class UserController {
  constructor(private service: UserService) {}

  @Get()
  async getUserInfo(@Request() req) {
    return this.service.getUserInfo(req.user.id);
  }
}
