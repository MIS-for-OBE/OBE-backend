import {
  BadRequestException,
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Post,
  Put,
  Query,
  Request,
  UseInterceptors,
  UsePipes,
  ValidationPipe,
} from '@nestjs/common';
import { ResponseDTO } from 'src/common/dto/response.dto';
import { CourseService } from './course.service';
import { ErrorInterceptor } from 'src/common/interceptor/error.interceptor';
import { Course } from './schemas/course.schema';
import { CourseSearchDTO } from './dto/search.dto';

@Controller('/course')
export class CourseController {
  constructor(private service: CourseService) {}

  @Get()
  @UseInterceptors(new ErrorInterceptor())
  @UsePipes(new ValidationPipe({ transform: true }))
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

  @Post()
  @UseInterceptors(new ErrorInterceptor())
  async createCourse(
    @Request() req,
    @Body() requestDTO: any,
  ): Promise<ResponseDTO<Course>> {
    return this.service.createCourse(req.user.id, requestDTO).then((result) => {
      const responseDTO = new ResponseDTO<Course>();
      responseDTO.data = result;
      return responseDTO;
    });
  }

  @Put('/:id')
  @UseInterceptors(new ErrorInterceptor())
  async updateCourse(
    @Param('id') id: string,
    @Body() requestDTO: any,
  ): Promise<ResponseDTO<Course>> {
    return this.service.updateCourse(id, requestDTO).then((result) => {
      if (!result) {
        throw new BadRequestException('Course not found.');
      }
      const responseDTO = new ResponseDTO<Course>();
      responseDTO.data = result;
      return responseDTO;
    });
  }

  @Delete('/:id')
  @UseInterceptors(new ErrorInterceptor())
  async deleteCourse(@Param('id') id: string): Promise<ResponseDTO<Course>> {
    return this.service.deleteCourse(id).then((result) => {
      if (!result) {
        throw new BadRequestException('Course not found.');
      }
      const responseDTO = new ResponseDTO<Course>();
      responseDTO.data = result;
      return responseDTO;
    });
  }
}
