import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Post,
  Put,
  Query,
  Request,
  UsePipes,
  ValidationPipe,
} from '@nestjs/common';
import { FacultyService } from './faculty.service';
import { ResponseDTO } from 'src/common/dto/response.dto';
import { Curriculum, Faculty } from './schemas/faculty.schema';
import { ApiTags } from '@nestjs/swagger';

@ApiTags('Faculty')
@Controller('/faculty')
@UsePipes(new ValidationPipe({ transform: true }))
export class FacultyController {
  constructor(private service: FacultyService) {}

  @Get()
  async getFaculty(@Request() req): Promise<ResponseDTO<any>> {
    return this.service.getFaculty(req.user.facultyCode).then((result) => {
      const responseDTO = new ResponseDTO<any>();
      responseDTO.data = result;
      return responseDTO;
    });
  }

  @Post('/:id')
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
