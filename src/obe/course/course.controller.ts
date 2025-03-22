import {
  Body,
  Controller,
  Delete,
  Get,
  HttpStatus,
  Param,
  Post,
  Put,
  Query,
  Request,
  UsePipes,
  ValidationPipe,
} from '@nestjs/common';
import { ResponseDTO } from 'src/common/dto/response.dto';
import { CourseService } from './course.service';
import { Course } from './schemas/course.schema';
import { CourseSearchDTO } from './dto/search.dto';
import { Public } from 'src/auth/metadata/public.metadata';
import {
  ApiBody,
  ApiExtraModels,
  ApiOkResponse,
  ApiOperation,
  ApiParam,
  ApiQuery,
  ApiTags,
  getSchemaPath,
} from '@nestjs/swagger';
import {
  ApiErrorResponse,
  ApiSuccessResponse,
  ApiUnauthorizedErrorResponse,
} from 'src/common/decorators/response.decorator';
import { DESCRIPTION, TEXT_ENUM } from 'src/common/enum/text.enum';
import { ERROR_ENUM } from 'src/common/enum/error.enum';
import {
  exampleCreateCourse,
  exampleResCreateCourse,
} from 'src/common/example/example';

@ApiTags('Course')
@Controller('/course')
@ApiExtraModels(Course)
@UsePipes(new ValidationPipe({ transform: true }))
export class CourseController {
  constructor(private service: CourseService) {}

  @Public()
  @Get()
  @ApiOperation({ summary: 'Search for courses' })
  @ApiOkResponse({
    description: DESCRIPTION.SUCCESS,
    schema: {
      properties: {
        message: { example: TEXT_ENUM.Success },
        data: {
          type: 'object',
          properties: {
            totalCount: { example: 1 },
            courses: {
              type: 'array',
              description: 'List of PLO objects.',
              items: { $ref: getSchemaPath(Course) },
            },
          },
        },
      },
    },
  })
  async searchCourse(
    @Request() req,
    @Query() searchDTO: CourseSearchDTO,
  ): Promise<ResponseDTO<any>> {
    return this.service.searchCourse(req?.user, searchDTO).then((result) => {
      const responseDTO = new ResponseDTO<any>();
      responseDTO.data = result;
      return responseDTO;
    });
  }

  @Public()
  @Get('one')
  @ApiOperation({ summary: 'Search for a single course' })
  @ApiSuccessResponse(Course)
  @ApiErrorResponse(
    HttpStatus.NOT_FOUND,
    DESCRIPTION.NOT_FOUND,
    ERROR_ENUM.NOT_FOUND,
    'Course not found',
  )
  async searchOneCourse(
    @Request() req,
    @Query() searchDTO: CourseSearchDTO,
  ): Promise<ResponseDTO<any>> {
    return this.service
      .searchOneCourse(req?.user?.id, searchDTO)
      .then((result) => {
        const responseDTO = new ResponseDTO<any>();
        responseDTO.data = result;
        return responseDTO;
      });
  }

  @Get('data/:courseNo')
  @ApiOperation({ summary: 'Get existing course data' })
  @ApiQuery({ name: 'academicyear' })
  @ApiQuery({ name: 'academicterm' })
  @ApiSuccessResponse(null, {
    name: 'Course CPE Mock',
    descTH: 'เทส',
    descEN: 'test',
  })
  @ApiUnauthorizedErrorResponse()
  async getExistCourseData(
    @Param('courseNo') courseNo: string,
    @Query() requestDTO: any,
  ): Promise<ResponseDTO<any>> {
    return this.service
      .getExistsCourseData(courseNo, requestDTO)
      .then((result) => {
        const responseDTO = new ResponseDTO<any>();
        responseDTO.data = result;
        return responseDTO;
      });
  }

  @Get('check')
  @ApiOperation({ summary: 'Check if a course can be created' })
  @ApiQuery({ name: 'courseNo' })
  @ApiQuery({ name: 'sections', isArray: true, example: [1, 801] })
  @ApiSuccessResponse(null, { message: TEXT_ENUM.Success })
  @ApiUnauthorizedErrorResponse()
  async checkCanCreateCourse(
    @Query() requestDTO: any,
  ): Promise<ResponseDTO<any>> {
    return this.service.checkCanCreateCourse(requestDTO).then((result) => {
      const responseDTO = new ResponseDTO<any>();
      responseDTO.data = result;
      return responseDTO;
    });
  }

  @Post()
  @ApiOperation({ summary: 'Create a new course' })
  @ApiBody({ schema: { example: exampleCreateCourse } })
  @ApiSuccessResponse(Course, exampleResCreateCourse)
  @ApiUnauthorizedErrorResponse()
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
  @ApiOperation({ summary: 'Update an existing course' })
  @ApiParam({ name: 'id', description: 'Course ID' })
  @ApiBody({
    schema: {
      example: {
        courseNo: '261999',
        courseName: 'Course CPE Mock',
        descTH: 'เทส 1',
        descEN: 'test 1',
        addFirstTime: true,
      },
    },
  })
  @ApiSuccessResponse(null, {
    id: 'xxxxxxxxxxxxxxxx2d70',
    courseNo: '261999',
    courseName: 'Course CPE Mock',
    descTH: 'เทส 1',
    descEN: 'test 1',
    addFirstTime: true,
  })
  @ApiUnauthorizedErrorResponse()
  @ApiErrorResponse(
    HttpStatus.BAD_REQUEST,
    DESCRIPTION.BAD_REQUEST,
    ERROR_ENUM.BAD_REQUEST,
    'Course No already exists',
  )
  @ApiErrorResponse(
    HttpStatus.NOT_FOUND,
    DESCRIPTION.NOT_FOUND,
    ERROR_ENUM.NOT_FOUND,
    'Course not found',
  )
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
  @ApiOperation({ summary: 'Delete a course' })
  @ApiParam({ name: 'id', description: 'Course ID' })
  @ApiSuccessResponse(null, { message: TEXT_ENUM.Success })
  @ApiUnauthorizedErrorResponse()
  @ApiErrorResponse(
    HttpStatus.NOT_FOUND,
    DESCRIPTION.NOT_FOUND,
    ERROR_ENUM.NOT_FOUND,
    'Course not found',
  )
  async deleteCourse(@Param('id') id: string): Promise<ResponseDTO<any>> {
    return this.service.deleteCourse(id).then((result) => {
      const responseDTO = new ResponseDTO<any>();
      responseDTO.data = result;
      return responseDTO;
    });
  }

  @Post('leave/:id')
  @ApiOperation({ summary: 'Leave a course' })
  @ApiParam({ name: 'id', description: 'Course ID' })
  @ApiSuccessResponse(null, { message: TEXT_ENUM.Success })
  @ApiUnauthorizedErrorResponse()
  @ApiErrorResponse(
    HttpStatus.NOT_FOUND,
    DESCRIPTION.NOT_FOUND,
    ERROR_ENUM.NOT_FOUND,
    'Course not found',
  )
  async leaveCourse(
    @Request() req,
    @Param('id') id: string,
  ): Promise<ResponseDTO<any>> {
    return this.service.leaveCourse(req.user.id, id).then((result) => {
      const responseDTO = new ResponseDTO<any>();
      responseDTO.data = result;
      return responseDTO;
    });
  }
}
