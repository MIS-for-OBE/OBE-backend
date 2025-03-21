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
import {
  ApiBody,
  ApiExcludeEndpoint,
  ApiOperation,
  ApiTags,
} from '@nestjs/swagger';
import {
  ApiSuccessResponse,
  ApiUnauthorizedErrorResponse,
} from 'src/common/decorators/response.decorator';
import { ROLE } from 'src/common/enum/role.enum';
import {
  exampleAdmin,
  exampleCurriculumAdmin,
  exampleInstructorList,
  exampleStudent,
} from 'src/common/example-response/example.response';

@ApiTags('User')
@Controller('/user')
@UsePipes(new ValidationPipe({ transform: true }))
export class UserController {
  constructor(private service: UserService) {}

  @Get()
  @ApiOperation({ summary: 'Get user info' })
  @ApiUnauthorizedErrorResponse()
  @ApiSuccessResponse(User, [
    { option: ROLE.STUDENT, data: exampleStudent },
    { option: ROLE.CURRICULUM_ADMIN, data: exampleCurriculumAdmin },
    { option: ROLE.ADMIN, data: exampleAdmin },
  ])
  async getUserInfo(@Request() req): Promise<ResponseDTO<User>> {
    return this.service.getUserInfo(req.user.id).then((result) => {
      const responseDTO = new ResponseDTO<any>();
      responseDTO.data = result;
      return responseDTO;
    });
  }

  @Post('terms-of-service')
  @ApiOperation({ summary: 'Accept or reject terms of service' })
  @ApiBody({
    description: 'User agreement on the terms of service',
    required: true,
    schema: { properties: { agree: { example: true } } },
  })
  @ApiUnauthorizedErrorResponse()
  @ApiSuccessResponse(null, { message: 'ok' })
  async termsOfService(
    @Request() req,
    @Body() body: { agree: boolean },
  ): Promise<ResponseDTO<any>> {
    return this.service.termsOfService(req.user.id, body).then((result) => {
      const responseDTO = new ResponseDTO<any>();
      responseDTO.data = result;
      return responseDTO;
    });
  }

  @Put()
  @ApiExcludeEndpoint()
  @ApiOperation({ summary: 'Update user details' })
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

  @Get('instructor')
  @ApiOperation({ summary: 'Get list of instructors' })
  @ApiUnauthorizedErrorResponse()
  @ApiSuccessResponse(User, { data: exampleInstructorList })
  async getInstructor(): Promise<ResponseDTO<User[]>> {
    return this.service.getInstructor().then((result) => {
      const responseDTO = new ResponseDTO<User[]>();
      responseDTO.data = result;
      return responseDTO;
    });
  }

  @Put('curr-admin')
  @ApiOperation({ summary: 'Update curriculum admin' })
  @ApiBody({
    description: 'Curriculum admin update information',
    required: true,
    schema: {
      properties: {
        id: { example: 'xxxxxxxxxxxxxxxx34ce' },
        email: { example: 'somchai_j@cmu.ac.th' },
        role: { example: ROLE.CURRICULUM_ADMIN },
        curriculums: { example: ['CPE-2563', 'ISNE-2566'] },
      },
    },
  })
  @ApiUnauthorizedErrorResponse()
  @ApiSuccessResponse(User, exampleCurriculumAdmin)
  async updateCurrAdmin(
    @Body()
    body: {
      id: string;
      email: string;
      role: ROLE;
      curriculums: string[];
    },
  ): Promise<ResponseDTO<User>> {
    return this.service.updateCurrAdmin(body).then((result) => {
      const responseDTO = new ResponseDTO<User>();
      responseDTO.data = result;
      return responseDTO;
    });
  }

  @Put('admin')
  @ApiOperation({ summary: 'Change admin' })
  @ApiBody({
    description: 'Update information',
    required: true,
    schema: {
      properties: {
        id: { description: 'ID of new Admin', example: 'xxxxxxxxxxxxxxxx34cf' },
        curriculums: {
          description: 'Curriculum that user can access',
          example: ['CPE-2563', 'ISNE-2566'],
        },
      },
    },
  })
  @ApiSuccessResponse(User, {
    data: { user: exampleCurriculumAdmin, newAdmin: exampleAdmin },
  })
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
