import {
  Body,
  Controller,
  Delete,
  Post,
  Put,
  Query,
  UsePipes,
  ValidationPipe,
} from '@nestjs/common';
import { ScoreService } from './score.service';
import { ResponseDTO } from 'src/common/dto/response.dto';
import { Section } from '../course/schemas/course.schema';
import { ApiBody, ApiOperation, ApiQuery, ApiTags } from '@nestjs/swagger';
import {
  exampleResSectionAssign,
  exampleResUploadScore,
  exampleUploadScore,
} from 'src/common/example/example';
import {
  ApiSuccessResponse,
  ApiUnauthorizedErrorResponse,
} from 'src/common/decorators/response.decorator';

@ApiTags('Score')
@Controller('/score')
@UsePipes(new ValidationPipe({ transform: true }))
export class ScoreController {
  constructor(private service: ScoreService) {}

  @Post()
  @ApiOperation({ summary: 'Upload scores for students' })
  @ApiBody({ schema: { example: exampleUploadScore } })
  @ApiSuccessResponse(Section, exampleResUploadScore('Quiz 1'))
  @ApiUnauthorizedErrorResponse()
  async uploadScore(@Body() requestDTO: any): Promise<ResponseDTO<Section[]>> {
    return this.service.uploadScore(requestDTO).then((result) => {
      const responseDTO = new ResponseDTO<Section[]>();
      responseDTO.data = result;
      return responseDTO;
    });
  }
  // async uploadScore(@Body() requestDTO: any): Promise<ResponseDTO<Section[]>> {
  //   const jobId = Math.random().toString(36).substring(7);
  //   return this.service.uploadScore(requestDTO, jobId).then((result) => {
  //     const responseDTO = new ResponseDTO<Section[]>();
  //     responseDTO.data = result;
  //     return responseDTO;
  //   });
  // }

  @Put('publish')
  @ApiOperation({ summary: 'Publish scores for assignments' })
  @ApiBody({
    schema: {
      properties: {
        course: { example: 'xxxxxxxxxxxxxxxx6483' },
        isPublish: { example: true },
        sections: { example: [1] },
        assignments: { example: ['Quiz 1'] },
      },
    },
  })
  @ApiSuccessResponse(Section, exampleResSectionAssign('Quiz 1', true))
  @ApiUnauthorizedErrorResponse()
  async publishScore(@Body() requestDTO: any): Promise<ResponseDTO<Section[]>> {
    return this.service.publishScore(requestDTO).then((result) => {
      const responseDTO = new ResponseDTO<Section[]>();
      responseDTO.data = result;
      return responseDTO;
    });
  }

  @Put('student')
  @ApiOperation({ summary: 'Update a student’s score' })
  @ApiBody({
    schema: {
      properties: {
        course: { example: 'xxxxxxxxxxxxxxxx6483' },
        sectionNo: { example: 1 },
        student: { example: 'xxxxxxxxxxxxxxxx34cc' },
        assignmentName: { example: 'Quiz 1' },
        questions: {
          type: 'array',
          items: {
            example: [
              { name: '1', score: 8 },
              { name: '2', score: 5 },
            ],
          },
        },
      },
    },
  })
  @ApiSuccessResponse(
    Section,
    exampleResSectionAssign('Quiz 1', false, false, [
      { name: '1', score: 8 },
      { name: '2', score: 5 },
    ]),
  )
  @ApiUnauthorizedErrorResponse()
  async updateStudentScore(
    @Body() requestDTO: any,
  ): Promise<ResponseDTO<Section[]>> {
    return this.service.updateStudentScore(requestDTO).then((result) => {
      const responseDTO = new ResponseDTO<Section[]>();
      responseDTO.data = result;
      return responseDTO;
    });
  }

  @Put()
  @ApiOperation({ summary: 'Update an assignment name' })
  @ApiBody({
    schema: {
      properties: {
        course: { example: 'xxxxxxxxxxxxxxxx6483' },
        sectionNo: { example: 1 },
        oldName: { example: 'Quiz 1' },
        name: { example: 'Quiz 2' },
      },
    },
  })
  @ApiSuccessResponse(Section, exampleResSectionAssign('Quiz 2'))
  @ApiUnauthorizedErrorResponse()
  async updateAssignment(
    @Body()
    requestDTO: {
      course: string;
      sectionNo: number;
      oldName: string;
      name: string;
    },
  ): Promise<ResponseDTO<Section[]>> {
    return this.service.updateAssignment(requestDTO).then((result) => {
      const responseDTO = new ResponseDTO<Section[]>();
      responseDTO.data = result;
      return responseDTO;
    });
  }

  @Delete()
  @ApiOperation({ summary: 'Delete an assignment' })
  @ApiQuery({ name: 'course', description: 'ID of the course' })
  @ApiQuery({
    name: 'sectionNo',
    description:
      'Section number from which to delete the assignment (if not provided, the assignment will be deleted from all sections)',
    required: false,
  })
  @ApiQuery({ name: 'name', description: 'Name of the assignment to delete' })
  @ApiSuccessResponse(Section, exampleResSectionAssign('Quiz 1', false, true))
  @ApiUnauthorizedErrorResponse()
  async deleteAssignment(
    @Query() requestDTO: any,
  ): Promise<ResponseDTO<Section[]>> {
    return this.service.deleteAssignment(requestDTO).then((result) => {
      const responseDTO = new ResponseDTO<Section[]>();
      responseDTO.data = result;
      return responseDTO;
    });
  }
}
