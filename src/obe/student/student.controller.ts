import {
  Get,
  Query,
  Request,
  Controller,
  UsePipes,
  ValidationPipe,
} from '@nestjs/common';
import { StudentService } from './student.service';
import { ResponseDTO } from 'src/common/dto/response.dto';
import { EnrollCourseSearchDTO } from './dto/search.dto';
import { ApiBody, ApiOperation, ApiQuery, ApiTags } from '@nestjs/swagger';
import {
  ApiSuccessResponse,
  ApiUnauthorizedErrorResponse,
} from 'src/common/decorators/response.decorator';
import {
  exampleAllEnrollCourses,
  exampleEnrollCourses,
} from 'src/common/example/example';
import { Course } from '../course/schemas/course.schema';

@ApiTags('Student')
@Controller('/student')
@UsePipes(new ValidationPipe({ transform: true }))
export class StudentController {
  constructor(private service: StudentService) {}

  @Get()
  @ApiOperation({ summary: 'Get student enroll courses' })
  @ApiUnauthorizedErrorResponse()
  @ApiSuccessResponse(Course, [
    { option: 'One Semester', data: exampleEnrollCourses },
    { option: 'All Enroll Courses', data: exampleAllEnrollCourses },
  ])
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
