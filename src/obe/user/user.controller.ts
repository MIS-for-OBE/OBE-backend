import {
  Body,
  Controller,
  Get,
  Post,
  Put,
  Request,
  UsePipes,
  ValidationPipe,
} from '@nestjs/common';
import { UserService } from './user.service';
import { ResponseDTO } from 'src/common/dto/response.dto';
import { User } from './schemas/user.schema';
import { ApiTags } from '@nestjs/swagger';

@ApiTags('User')
@Controller('/user')
@UsePipes(new ValidationPipe({ transform: true }))
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

  @Post('terms-of-service')
  async termsOfService(
    @Request() req,
    @Body() body,
  ): Promise<ResponseDTO<any>> {
    return this.service.termsOfService(req.user.id, body).then((result) => {
      const responseDTO = new ResponseDTO<any>();
      responseDTO.data = result;
      return responseDTO;
    });
  }

  @Get('instructor')
  async getInstructor(): Promise<ResponseDTO<User[]>> {
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

  @Put('curr-admin')
  async updateCurrAdmin(@Body() body: any): Promise<ResponseDTO<User>> {
    return this.service.updateCurrAdmin(body).then((result) => {
      const responseDTO = new ResponseDTO<any>();
      responseDTO.data = result;
      return responseDTO;
    });
  }

  @Put('admin')
  async updateAdmin(
    @Request() req,
    @Body() body: any,
  ): Promise<ResponseDTO<any>> {
    return this.service.updateAdmin(req.user.id, body).then((result) => {
      const responseDTO = new ResponseDTO<any>();
      responseDTO.data = result;
      return responseDTO;
    });
  }
}
