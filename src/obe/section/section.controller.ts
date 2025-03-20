import {
  Body,
  Controller,
  Delete,
  Param,
  Post,
  Put,
  Query,
  UsePipes,
  ValidationPipe,
} from '@nestjs/common';
import { SectionService } from './section.service';
import { ResponseDTO } from 'src/common/dto/response.dto';
import { Section } from '../course/schemas/course.schema';
import { ApiTags } from '@nestjs/swagger';

@ApiTags('Section')
@Controller('/section')
@UsePipes(new ValidationPipe({ transform: true }))
export class SectionController {
  constructor(private service: SectionService) {}

  @Post('student-list')
  async uploadStudentList(
    @Body() requestDTO: any,
  ): Promise<ResponseDTO<Section[]>> {
    return this.service.uploadStudentList(requestDTO).then((result) => {
      const responseDTO = new ResponseDTO<Section[]>();
      responseDTO.data = result;
      return responseDTO;
    });
  }

  @Post('student')
  async addStudent(@Body() requestDTO: any): Promise<ResponseDTO<Section[]>> {
    return this.service.addStudent(requestDTO).then((result) => {
      const responseDTO = new ResponseDTO<Section[]>();
      responseDTO.data = result;
      return responseDTO;
    });
  }

  @Put('student')
  async updateStudent(
    @Body() requestDTO: any,
  ): Promise<ResponseDTO<Section[]>> {
    return this.service.updateStudent(requestDTO).then((result) => {
      const responseDTO = new ResponseDTO<Section[]>();
      responseDTO.data = result;
      return responseDTO;
    });
  }

  @Delete('student')
  async deleteStudent(
    @Query() requestDTO: any,
  ): Promise<ResponseDTO<Section[]>> {
    return this.service.deleteStudent(requestDTO).then((result) => {
      const responseDTO = new ResponseDTO<Section[]>();
      responseDTO.data = result;
      return responseDTO;
    });
  }

  @Put('/active')
  async updateSectionActive(
    @Body() requestDTO: any,
  ): Promise<ResponseDTO<Section>> {
    return this.service.updateSectionActive(requestDTO).then((result) => {
      const responseDTO = new ResponseDTO<Section>();
      responseDTO.data = result;
      return responseDTO;
    });
  }

  @Put('/:id')
  async updateSection(
    @Param('id') id: string,
    @Body() requestDTO: any,
  ): Promise<ResponseDTO<Section>> {
    return this.service.updateSection(id, requestDTO).then((result) => {
      const responseDTO = new ResponseDTO<Section>();
      responseDTO.data = result;
      return responseDTO;
    });
  }

  @Delete('/:id')
  async deleteSection(
    @Param('id') id: string,
    @Query() requestDTO: any,
  ): Promise<ResponseDTO<Section>> {
    return this.service.deleteSection(id, requestDTO).then((result) => {
      const responseDTO = new ResponseDTO<Section>();
      responseDTO.data = result;
      return responseDTO;
    });
  }
}
