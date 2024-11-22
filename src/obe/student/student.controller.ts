import {
  Body,
  Get,
  Param,
  Query,
  Request,
  Controller,
  UsePipes,
  ValidationPipe,
} from '@nestjs/common';
import { StudentService } from './student.service';
import { ResponseDTO } from 'src/common/dto/response.dto';
import { EnrollCourseSearchDTO } from './dto/search.dto';

@Controller('/student')
@UsePipes(new ValidationPipe({ transform: true }))
export class StudentController {
  constructor(private service: StudentService) {}

  @Get()
  async getEnrollCourses(
    @Request() req,
    @Query() searchDTO: EnrollCourseSearchDTO,
  ): Promise<ResponseDTO<any>> {
    return this.service.getEnrollCourses(req.user, searchDTO).then((result) => {
      const responseDTO = new ResponseDTO<any>();
      responseDTO.data = result;
      return responseDTO;
    });
  }
}
