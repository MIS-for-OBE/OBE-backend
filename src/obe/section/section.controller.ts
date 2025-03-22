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
import { ApiBody, ApiOperation, ApiParam, ApiTags } from '@nestjs/swagger';
import {
  ApiSuccessResponse,
  ApiUnauthorizedErrorResponse,
} from 'src/common/decorators/response.decorator';
import {
  exampleAddEditStudent,
  exampleStudent,
  exampleUpdateSection,
  exampleUploadStdList,
} from 'src/common/example/example';
import { DeleteSectionDTO, DeleteStudentDTO } from './dto/dto';
import { TEXT_ENUM } from 'src/common/enum/text.enum';

@ApiTags('Section')
@Controller('/section')
@UsePipes(new ValidationPipe({ transform: true }))
export class SectionController {
  constructor(private service: SectionService) {}

  @Post('student-list')
  @ApiOperation({ summary: 'Upload a list of students' })
  @ApiBody({ schema: { example: exampleUploadStdList } })
  @ApiSuccessResponse(null, [
    { id: 'xxxxxxxxxxxxxxxx6484', students: [exampleStudent()] },
  ])
  @ApiUnauthorizedErrorResponse()
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
  @ApiOperation({ summary: 'Add a student to section' })
  @ApiBody({ schema: { example: exampleAddEditStudent(1) } })
  @ApiSuccessResponse(null, [
    {
      students: [
        { student: exampleStudent(), scores: [] },
        { student: exampleAddEditStudent(1, false, true) },
      ],
      id: 'xxxxxxxxxxxxxxxx522a',
    },
  ])
  @ApiUnauthorizedErrorResponse()
  async addStudent(@Body() requestDTO: any): Promise<ResponseDTO<Section[]>> {
    return this.service.addStudent(requestDTO).then((result) => {
      const responseDTO = new ResponseDTO<Section[]>();
      responseDTO.data = result;
      return responseDTO;
    });
  }

  @Put('student')
  @ApiOperation({ summary: 'Update a student' })
  @ApiBody({ schema: { example: exampleAddEditStudent(801, true) } })
  @ApiSuccessResponse(null, [
    {
      students: [{ student: exampleStudent(), scores: [] }],
      id: 'xxxxxxxxxxxxxxxx522a',
    },
    {
      students: [
        {
          student: {
            id: 'xxxxxxxxxxxxxxxx9b72',
            studentId: '640610003',
            firstNameTH: 'ชื่อ',
            latNameTH: 'นามสกุล',
            email: 'test@cmu.ac.th',
          },
        },
      ],
      id: 'xxxxxxxxxxxxxxxx522b',
    },
  ])
  @ApiUnauthorizedErrorResponse()
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
  @ApiOperation({ summary: 'Delete a student from section' })
  @ApiUnauthorizedErrorResponse()
  @ApiSuccessResponse(null, [{ id: 'xxxxxxxxxxxxxxxx6484', students: [] }])
  async deleteStudent(
    @Query() requestDTO: DeleteStudentDTO,
  ): Promise<ResponseDTO<Section[]>> {
    return this.service.deleteStudent(requestDTO).then((result) => {
      const responseDTO = new ResponseDTO<Section[]>();
      responseDTO.data = result;
      return responseDTO;
    });
  }

  @Put('/active')
  @ApiOperation({ summary: 'Update section active status' })
  @ApiBody({
    schema: {
      properties: {
        courseId: { example: 'xxxxxxxxxxxxxxxx6483' },
        sectionNo: { example: 1 },
        isActive: { example: true },
      },
    },
  })
  @ApiSuccessResponse(null, { message: TEXT_ENUM.Success })
  @ApiUnauthorizedErrorResponse()
  async updateSectionActive(
    @Body()
    requestDTO: {
      courseId: string;
      sectionNo: number;
      isActive: boolean;
    },
  ): Promise<ResponseDTO<Section>> {
    return this.service.updateSectionActive(requestDTO).then((result) => {
      const responseDTO = new ResponseDTO<Section>();
      responseDTO.data = result;
      return responseDTO;
    });
  }

  @Put('/:id')
  @ApiOperation({ summary: 'Update a section' })
  @ApiParam({
    name: 'id',
    required: true,
    description: 'The ID of the section to be updated',
  })
  @ApiBody({ schema: { example: exampleUpdateSection } })
  @ApiSuccessResponse(null, { message: TEXT_ENUM.Success })
  @ApiUnauthorizedErrorResponse()
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
  @ApiOperation({ summary: 'Delete a section' })
  @ApiParam({
    name: 'id',
    required: true,
    description: 'The ID of the section to be deleted',
  })
  @ApiSuccessResponse(null, { message: TEXT_ENUM.Success })
  @ApiUnauthorizedErrorResponse()
  async deleteSection(
    @Param('id') id: string,
    @Query() searchDTO: DeleteSectionDTO,
  ): Promise<ResponseDTO<Section>> {
    return this.service.deleteSection(id, searchDTO).then((result) => {
      const responseDTO = new ResponseDTO<Section>();
      responseDTO.data = result;
      return responseDTO;
    });
  }
}
