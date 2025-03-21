import {
  Body,
  Controller,
  Delete,
  Get,
  HttpStatus,
  Param,
  Post,
  Put,
  Request,
  UsePipes,
  ValidationPipe,
} from '@nestjs/common';
import { FacultyService } from './faculty.service';
import { ResponseDTO } from 'src/common/dto/response.dto';
import { Curriculum, Faculty } from './schemas/faculty.schema';
import {
  ApiExtraModels,
  ApiOperation,
  ApiParam,
  ApiTags,
} from '@nestjs/swagger';
import {
  ApiErrorResponse,
  ApiSuccessResponse,
  ApiUnauthorizedErrorResponse,
} from 'src/common/decorators/response.decorator';
import { DESCRIPTION, TEXT_ENUM } from 'src/common/enum/text.enum';
import { ERROR_ENUM } from 'src/common/enum/error.enum';

@ApiTags('Faculty')
@Controller('/faculty')
@ApiExtraModels(Faculty)
@UsePipes(new ValidationPipe({ transform: true }))
export class FacultyController {
  constructor(private service: FacultyService) {}

  @Get()
  @ApiOperation({
    summary: 'Get faculty details based on the user’s faculty code',
  })
  @ApiUnauthorizedErrorResponse()
  @ApiSuccessResponse(Faculty)
  @ApiErrorResponse(
    HttpStatus.NOT_FOUND,
    DESCRIPTION.FORBIDDEN,
    ERROR_ENUM.NOT_FOUND,
    'Faculty not found',
  )
  async getFaculty(@Request() req): Promise<ResponseDTO<Faculty>> {
    return this.service.getFaculty(req.user.facultyCode).then((result) => {
      const responseDTO = new ResponseDTO<Faculty>();
      responseDTO.data = result;
      return responseDTO;
    });
  }

  @Post('/:id')
  @ApiOperation({
    summary: 'Create a new curriculum within a faculty',
  })
  @ApiParam({
    name: 'id',
    required: true,
    example: 'xxxxxxxxxxxxxxxx2d70',
    description: 'The ID of the faculty where the curriculum will be created',
  })
  @ApiUnauthorizedErrorResponse()
  @ApiSuccessResponse(null, { message: TEXT_ENUM.Success })
  @ApiErrorResponse(
    HttpStatus.NOT_FOUND,
    DESCRIPTION.FORBIDDEN,
    ERROR_ENUM.NOT_FOUND,
    'Faculty not found',
  )
  async createCurriculum(
    @Request() req,
    @Param('id') id: string,
    @Body() requestDTO: Curriculum,
  ): Promise<ResponseDTO<Faculty>> {
    return this.service
      .createCurriculum(req.user, id, requestDTO)
      .then((result) => {
        const responseDTO = new ResponseDTO<Faculty>();
        responseDTO.data = result;
        return responseDTO;
      });
  }

  @Put('/:id/:code')
  @ApiOperation({
    summary: 'Update an existing curriculum in a faculty',
  })
  @ApiParam({
    name: 'id',
    required: true,
    example: 'xxxxxxxxxxxxxxxx2d70',
    description: 'The ID of the faculty that contains the curriculum',
  })
  @ApiParam({
    name: 'code',
    required: true,
    example: 'CPE-2563',
    description: 'The code of curriculum to be updated',
  })
  @ApiSuccessResponse(null, { message: TEXT_ENUM.Success })
  @ApiUnauthorizedErrorResponse()
  @ApiErrorResponse(
    HttpStatus.NOT_FOUND,
    DESCRIPTION.FORBIDDEN,
    ERROR_ENUM.NOT_FOUND,
    'Faculty not found',
  )
  async updateCurriculum(
    @Param() params: { id: string; code: string },
    @Body() requestDTO: Curriculum,
  ): Promise<ResponseDTO<Faculty>> {
    return this.service.updateCurriculum(params, requestDTO).then((result) => {
      const responseDTO = new ResponseDTO<Faculty>();
      responseDTO.data = result;
      return responseDTO;
    });
  }

  @Delete('/:id/:code')
  @ApiOperation({
    summary: 'Delete a curriculum from a faculty',
  })
  @ApiParam({
    name: 'id',
    required: true,
    example: 'ENG',
    description: 'The ID of the faculty that contains the curriculum',
  })
  @ApiParam({
    name: 'code',
    required: true,
    example: 'CPE-2563',
    description: 'The code of curriculum to be deleted',
  })
  @ApiSuccessResponse(null, { message: TEXT_ENUM.Success })
  @ApiUnauthorizedErrorResponse()
  @ApiErrorResponse(
    HttpStatus.NOT_FOUND,
    DESCRIPTION.FORBIDDEN,
    ERROR_ENUM.NOT_FOUND,
    'Faculty not found',
  )
  async deleteCurriculum(
    @Param() params: { id: string; code: string },
  ): Promise<ResponseDTO<Faculty>> {
    return this.service
      .deleteCurriculum(params.id, params.code)
      .then((result) => {
        const responseDTO = new ResponseDTO<Faculty>();
        responseDTO.data = result;
        return responseDTO;
      });
  }
}
