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
import { ApiOperation, ApiTags } from '@nestjs/swagger';
import { ApiSuccessResponse, ApiUnauthorizedErrorResponse } from 'src/common/decorators/response.decorator';
import { ROLE } from 'src/common/enum/role.enum';
import {
  exampleAdmin,
  exampleCurriculumAdmin,
  exampleStudent,
} from 'src/common/example-response/example.response';

@ApiTags('User')
@Controller('/user')
@UsePipes(new ValidationPipe({ transform: true }))
export class UserController {
  constructor(private service: UserService) {}

  @Get()
  @ApiOperation({ summary: 'Get user info' })
  @ApiSuccessResponse(User, [
    { option: ROLE.STUDENT, data: exampleStudent },
    { option: ROLE.CURRICULUM_ADMIN, data: exampleCurriculumAdmin },
    { option: ROLE.ADMIN, data: exampleAdmin },
  ])
  @ApiUnauthorizedErrorResponse()
  async getUserInfo(@Request() req): Promise<ResponseDTO<User>> {
    return this.service.getUserInfo(req.user.id).then((result) => {
      const responseDTO = new ResponseDTO<any>();
      responseDTO.data = result;
      return responseDTO;
    });
  }

  @Post('terms-of-service')
  @ApiOperation({ summary: 'Accept or reject terms of service' })
  @ApiSuccessResponse({
    message: 'ok',
  })
  @ApiUnauthorizedErrorResponse()
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
  @ApiUnauthorizedErrorResponse()
  async getInstructor(): Promise<ResponseDTO<User[]>> {
    return this.service.getInstructor().then((result) => {
      const responseDTO = new ResponseDTO<User[]>();
      responseDTO.data = result;
      return responseDTO;
    });
  }

  @Put()
  @ApiUnauthorizedErrorResponse()
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
  @ApiUnauthorizedErrorResponse()
  async updateCurrAdmin(@Body() body: any): Promise<ResponseDTO<User>> {
    return this.service.updateCurrAdmin(body).then((result) => {
      const responseDTO = new ResponseDTO<any>();
      responseDTO.data = result;
      return responseDTO;
    });
  }

  @Put('admin')
  @ApiUnauthorizedErrorResponse()
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
