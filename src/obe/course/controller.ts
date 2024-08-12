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
import { ResponseDTO } from 'src/common/dto/response.dto';
import { CourseService } from './service';
import { Course } from './schemas/schema';
import { CourseSearchDTO } from './dto/search.dto';

@Controller('/course')
@UsePipes(new ValidationPipe({ transform: true }))
export class CourseController {
  constructor(private service: CourseService) {}

  @Get()
  async searchCourse(
    @Request() req,
    @Query() searchDTO: CourseSearchDTO,
  ): Promise<ResponseDTO<any>> {
    return this.service.searchCourse(req.user.id, searchDTO).then((result) => {
      const responseDTO = new ResponseDTO<any>();
      responseDTO.data = result;
      return responseDTO;
    });
  }

  @Get('one')
  async searchOneCourse(
    @Request() req,
    @Query() searchDTO: CourseSearchDTO,
  ): Promise<ResponseDTO<Course>> {
    return this.service
      .searchOneCourse(req.user.id, searchDTO)
      .then((result) => {
        const responseDTO = new ResponseDTO<Course>();
        responseDTO.data = result;
        return responseDTO;
      });
  }

  @Post()
  async createCourse(
    @Request() req,
    @Body() requestDTO: any,
  ): Promise<ResponseDTO<any>> {
    return this.service.createCourse(req.user.id, requestDTO).then((result) => {
      const responseDTO = new ResponseDTO<any>();
      responseDTO.data = result;
      return responseDTO;
    });
  }

  @Put('/:id')
  async updateCourse(
    @Param('id') id: string,
    @Body() requestDTO: any,
  ): Promise<ResponseDTO<Course>> {
    return this.service.updateCourse(id, requestDTO).then((result) => {
      const responseDTO = new ResponseDTO<Course>();
      responseDTO.data = result;
      return responseDTO;
    });
  }

  @Delete('/:id')
  async deleteCourse(@Param('id') id: string): Promise<ResponseDTO<Course>> {
    return this.service.deleteCourse(id).then((result) => {
      const responseDTO = new ResponseDTO<Course>();
      responseDTO.data = result;
      return responseDTO;
    });
  }

  @Post('leave/:id')
  async leaveCourse(
    @Request() req,
    @Param('id') id: string,
  ): Promise<ResponseDTO<Course>> {
    return this.service.leaveCourse(req.user.id, id).then((result) => {
      const responseDTO = new ResponseDTO<Course>();
      responseDTO.data = result;
      return responseDTO;
    });
  }
}
