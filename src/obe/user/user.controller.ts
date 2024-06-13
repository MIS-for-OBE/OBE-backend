import {
  Body,
  Controller,
  Get,
  Post,
  Put,
  Request,
  UseInterceptors,
  UsePipes,
  ValidationPipe,
} from '@nestjs/common';
import { UserService } from './user.service';
import { ResponseDTO } from 'src/common/dto/response.dto';
import { User } from './schemas/user.schema';
import { ErrorInterceptor } from 'src/common/interceptor/error.interceptor';

@Controller('/user')
@UseInterceptors(new ErrorInterceptor())
export class UserController {
  constructor(private service: UserService) {}

  @Get()
  async getUserInfo(@Request() req): Promise<ResponseDTO<User>> {
    return this.service.getUserInfo(req.user.id).then((result) => {
      const responseDTO = new ResponseDTO<any>();
      responseDTO.data = result;
      return responseDTO;
    });
  }

  @Get('instructor')
  async getInstructor(@Request() req): Promise<ResponseDTO<User[]>> {
    return this.service.getInstructor().then((result) => {
      const responseDTO = new ResponseDTO<User[]>();
      responseDTO.data = result;
      return responseDTO;
    });
  }

  @Put()
  async updateUser(
    @Request() req,
    @Body() body: any,
  ): Promise<ResponseDTO<User>> {
    return this.service.updateUser(req.user.id, body).then((result) => {
      const responseDTO = new ResponseDTO<any>();
      responseDTO.data = result;
      return responseDTO;
    });
  }
}
