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
import { CourseManagementService } from './courseManagement.service';
import { CourseManagement } from './schemas/courseManagement.schema';
import { CourseManagementSearchDTO } from './dto/search.dto';
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
  exampleCreateCourseManagement,
  exampleEditCourseManagement,
  exampleInstructor,
  exampleMapPLO,
  exampleResCreateCourseManagement,
} from 'src/common/example/example';
import { Course } from '../course/schemas/course.schema';
import {
  DeleteCourseManagementDTO,
  DeleteSectionManagementDTO,
} from './dto/dto';
import { COURSE_TYPE } from 'src/common/enum/type.enum';

@ApiTags('Course Management')
@Controller('/course-management')
@ApiExtraModels(CourseManagement)
@UsePipes(new ValidationPipe({ transform: true }))
export class CourseManagementController {
  constructor(private service: CourseManagementService) {}

  @Get()
  @ApiOperation({ summary: 'Search for course management' })
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
              description: 'List of courses.',
              items: { $ref: getSchemaPath(CourseManagement) },
            },
          },
        },
      },
    },
  })
  @ApiUnauthorizedErrorResponse()
  async searchCourseManagement(
    @Query() searchDTO: CourseManagementSearchDTO,
  ): Promise<ResponseDTO<CourseManagement[]>> {
    return this.service.searchCourseManagement(searchDTO).then((result) => {
      const responseDTO = new ResponseDTO<CourseManagement[]>();
      responseDTO.data = result;
      return responseDTO;
    });
  }

  @Public()
  @Get('one')
  @ApiOperation({ summary: 'Search for one course management' })
  @ApiQuery({ name: 'courseNo', required: false })
  @ApiQuery({ name: 'courseSyllabus', required: false })
  @ApiSuccessResponse(CourseManagement)
  async searchOneCourseManagement(
    @Query() searchDTO: { courseNo: string; courseSyllabus: boolean },
  ): Promise<ResponseDTO<any>> {
    return this.service.searchOneCourseManagement(searchDTO).then((result) => {
      const responseDTO = new ResponseDTO<any>();
      responseDTO.data = result;
      return responseDTO;
    });
  }

  @Post()
  @ApiOperation({ summary: 'Create a new course management' })
  @ApiBody({ schema: { example: exampleCreateCourseManagement } })
  @ApiSuccessResponse(CourseManagement, exampleResCreateCourseManagement)
  @ApiUnauthorizedErrorResponse()
  @ApiErrorResponse(
    HttpStatus.BAD_REQUEST,
    DESCRIPTION.BAD_REQUEST,
    ERROR_ENUM.BAD_REQUEST,
    'Course No already exists',
  )
  async createCourseManagement(
    @Body() requestDTO: CourseManagement,
  ): Promise<ResponseDTO<CourseManagement>> {
    return this.service.createCourseManagement(requestDTO).then((result) => {
      const responseDTO = new ResponseDTO<CourseManagement>();
      responseDTO.data = result;
      return responseDTO;
    });
  }

  @Get('check')
  @ApiOperation({ summary: 'Check if a new section can be created' })
  @ApiQuery({ name: 'id', description: 'ID of course management' })
  @ApiQuery({
    name: 'sections',
    isArray: true,
    description: 'List of Section No to be created',
    example: [1, 801],
  })
  @ApiUnauthorizedErrorResponse()
  @ApiSuccessResponse(null, { message: TEXT_ENUM.Success })
  @ApiErrorResponse(
    HttpStatus.BAD_REQUEST,
    DESCRIPTION.BAD_REQUEST,
    ERROR_ENUM.BAD_REQUEST,
    {
      title: 'Section existing',
      message: 'Section 001, 801 has been already added.',
    },
  )
  async checkCanCreateSection(
    @Query() requestDTO: any,
  ): Promise<ResponseDTO<any>> {
    return this.service.checkCanCreateSection(requestDTO).then((result) => {
      const responseDTO = new ResponseDTO<any>();
      responseDTO.data = result;
      return responseDTO;
    });
  }

  // @Post('section/:id')
  // async createSectionManagement(
  //   @Param('id') id: string,
  //   @Body() requestDTO: any,
  // ): Promise<ResponseDTO<any>> {
  //   return this.service
  //     .createSectionManagement(id, requestDTO)
  //     .then((result) => {
  //       const responseDTO = new ResponseDTO<any>();
  //       responseDTO.data = result;
  //       return responseDTO;
  //     });
  // }

  @Put('plo-mapping')
  @ApiOperation({ summary: 'Map PLO (Program Learning Outcomes)' })
  @ApiBody({ schema: { example: exampleMapPLO } })
  @ApiOkResponse({
    description: DESCRIPTION.SUCCESS,
    schema: {
      properties: {
        message: { example: TEXT_ENUM.Success },
        data: {
          type: 'array',
          description: 'List of courses.',
          items: { $ref: getSchemaPath(CourseManagement) },
        },
      },
    },
  })
  @ApiUnauthorizedErrorResponse()
  async ploMapping(@Body() requestDTO: any): Promise<ResponseDTO<any>> {
    return this.service.ploMapping(requestDTO).then((result) => {
      const responseDTO = new ResponseDTO<any>();
      responseDTO.data = result;
      return responseDTO;
    });
  }

  @Put('co-instructor')
  @ApiOperation({ summary: 'Update co-instructor sections' })
  @ApiBody({
    schema: {
      example: {
        year: 2567,
        semester: 2,
        courseNo: '261999',
        data: [{ sectionNo: 1, coInstructors: ['xxxxxxxxxxxxxxxx0b50'] }],
        actionType: 'courseManagement',
      },
    },
  })
  @ApiOkResponse({
    description: DESCRIPTION.SUCCESS,
    schema: {
      properties: {
        message: { example: TEXT_ENUM.Success },
        data: {
          type: 'object',
          properties: {
            courseManagement: { $ref: getSchemaPath(CourseManagement) },
            course: { $ref: getSchemaPath(Course) },
          },
        },
      },
    },
  })
  @ApiUnauthorizedErrorResponse()
  @ApiErrorResponse(
    HttpStatus.NOT_FOUND,
    DESCRIPTION.NOT_FOUND,
    ERROR_ENUM.NOT_FOUND,
    'CourseManagement not found',
  )
  async updateCoInsSections(
    @Request() req,
    @Body() requestDTO: any,
  ): Promise<ResponseDTO<any>> {
    return this.service
      .updateCoInsSections(req.user, requestDTO)
      .then((result) => {
        const responseDTO = new ResponseDTO<any>();
        responseDTO.data = result;
        return responseDTO;
      });
  }

  @Put('/:id')
  @ApiOperation({ summary: 'Update course management by ID' })
  @ApiBody({ schema: { example: exampleEditCourseManagement } })
  @ApiUnauthorizedErrorResponse()
  @ApiSuccessResponse(null, {
    id: 'xxxxxxxxxxxxxxxx82cb',
    ...exampleEditCourseManagement,
    courseId: 'xxxxxxxxxxxxxxxx9756',
  })
  @ApiErrorResponse(
    HttpStatus.NOT_FOUND,
    DESCRIPTION.NOT_FOUND,
    ERROR_ENUM.NOT_FOUND,
    'CourseManagement not found',
  )
  async updateCourseManagement(
    @Param('id') id: string,
    @Body() requestDTO: any,
  ): Promise<ResponseDTO<any>> {
    return this.service
      .updateCourseManagement(id, requestDTO)
      .then((result) => {
        const responseDTO = new ResponseDTO<any>();
        responseDTO.data = result;
        return responseDTO;
      });
  }

  @Put('/:id/:section')
  @ApiOperation({ summary: 'Update section management by ID and section' })
  @ApiParam({ name: 'id', description: 'Course Management ID' })
  @ApiParam({ name: 'section', description: 'Section Management ID' })
  @ApiBody({
    schema: {
      example: {
        year: 2567,
        semester: 2,
        courseNo: '261999',
        oldSectionNo: 2,
        type: COURSE_TYPE.GENERAL,
        data: {
          sectionNo: 1,
          semester: [2],
          curriculum: null,
        },
        openThisTerm: true,
      },
    },
  })
  @ApiSuccessResponse(null, {
    courseId: 'xxxxxxxxxxxxxxxx9756',
    secId: 'xxxxxxxxxxxxxxxx82cb',
    updateSection: {
      sectionNo: 1,
      semester: [2],
      instructor: exampleInstructor(),
      coInstructors: [],
      ploRequire: [],
      id: 'xxxxxxxxxxxxxxxxfaf4',
    },
  })
  @ApiUnauthorizedErrorResponse()
  @ApiErrorResponse(
    HttpStatus.BAD_REQUEST,
    DESCRIPTION.BAD_REQUEST,
    ERROR_ENUM.BAD_REQUEST,
    'Section No already exists',
  )
  @ApiErrorResponse(
    HttpStatus.NOT_FOUND,
    DESCRIPTION.NOT_FOUND,
    ERROR_ENUM.NOT_FOUND,
    [
      { option: 'Course not found', message: 'CourseManagement not found' },
      { option: 'Section not found', message: 'SectionManagement not found' },
    ],
  )
  async updateSectionManagement(
    @Param() params: any,
    @Body() requestDTO: any,
  ): Promise<ResponseDTO<any>> {
    return this.service
      .updateSectionManagement(params, requestDTO)
      .then((result) => {
        const responseDTO = new ResponseDTO<any>();
        responseDTO.data = result;
        return responseDTO;
      });
  }

  @Delete('/:id')
  @ApiOperation({ summary: 'Delete course management by ID' })
  @ApiSuccessResponse(null, {
    id: 'xxxxxxxxxxxxxxxx82cb',
    courseId: 'xxxxxxxxxxxxxxxx9756',
  })
  @ApiUnauthorizedErrorResponse()
  @ApiErrorResponse(
    HttpStatus.NOT_FOUND,
    DESCRIPTION.NOT_FOUND,
    ERROR_ENUM.NOT_FOUND,
    'CourseManagement not found',
  )
  async deleteCourseManagement(
    @Param('id') id: string,
    @Query() requestDTO: DeleteCourseManagementDTO,
  ): Promise<ResponseDTO<any>> {
    return this.service
      .deleteCourseManagement(id, requestDTO)
      .then((result) => {
        const responseDTO = new ResponseDTO<any>();
        responseDTO.data = result;
        return responseDTO;
      });
  }

  @Delete('/:id/:section')
  @ApiOperation({ summary: 'Delete section management by ID and section' })
  @ApiParam({ name: 'id', description: 'Course Management ID' })
  @ApiParam({ name: 'section', description: 'Section Management ID' })
  @ApiSuccessResponse(null, {
    courseId: 'xxxxxxxxxxxxxxxx9756',
    secId: 'xxxxxxxxxxxxxxxx82cb',
    updateCourse: {
      courseNo: '261999',
      courseName: 'Course CPE Mock',
      descTH: 'เทส',
      descEN: 'test',
      updatedYear: 2567,
      updatedSemester: 2,
      type: COURSE_TYPE.GENERAL,
      sections: [],
      ploRequire: [],
      createdAt: '2025-03-22T14:37:19.224Z',
      updatedAt: '2025-03-22T14:37:42.244Z',
      id: 'xxxxxxxxxxxxxxxxfaf2',
    },
  })
  @ApiUnauthorizedErrorResponse()
  @ApiErrorResponse(
    HttpStatus.NOT_FOUND,
    DESCRIPTION.NOT_FOUND,
    ERROR_ENUM.NOT_FOUND,
    'CourseManagement not found',
  )
  async deleteSectionManagement(
    @Param() params: any,
    @Query() requestDTO: DeleteSectionManagementDTO,
  ): Promise<ResponseDTO<any>> {
    return this.service
      .deleteSectionManagement(params, requestDTO)
      .then((result) => {
        const responseDTO = new ResponseDTO<CourseManagement>();
        responseDTO.data = result;
        return responseDTO;
      });
  }
}
