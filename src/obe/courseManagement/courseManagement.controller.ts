import {
  BadRequestException,
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Post,
  Query,
  Request,
  UseInterceptors,
} from '@nestjs/common';
import { ResponseDTO } from 'src/common/dto/response.dto';
import { CourseManagementService } from './courseManagement.service';
import { ErrorInterceptor } from 'src/common/interceptor/error.interceptor';
import {
  CourseManagement,
  CourseManagementDocument,
} from './schemas/courseManagement.schema';

@Controller('/courseManagements')
export class CourseManagementController {
  constructor(private service: CourseManagementService) {}

  @Get()
  @UseInterceptors(new ErrorInterceptor())
  async searchAll(
    @Query() searchDTO: any,
  ): Promise<ResponseDTO<CourseManagement[]>> {
    return this.service.searchCourseManagement(searchDTO).then((result) => {
      const responseDTO = new ResponseDTO<CourseManagement[]>();
      responseDTO.data = result;
      return responseDTO;
    });
  }

  @Post()
  @UseInterceptors(new ErrorInterceptor())
  async createCourseManagement(
    @Request() req,
    @Body() requestDTO: CourseManagementDocument,
  ): Promise<ResponseDTO<CourseManagement>> {
    return this.service
      .createCourseManagement(req.user.id, requestDTO)
      .then((result) => {
        const responseDTO = new ResponseDTO<CourseManagement>();
        responseDTO.data = result;
        return responseDTO;
      });
  }

  // @Delete('/:id')
  // @UseInterceptors(new ErrorInterceptor())
  // async deleteCourseManagement(
  //   @Param('id') id: string,
  // ): Promise<ResponseDTO<CourseManagement>> {
  //   return this.service.deleteCourseManagement(id).then((result) => {
  //     if (!result) {
  //       throw new BadRequestException('CourseManagement not found.');
  //     }
  //     const responseDTO = new ResponseDTO<CourseManagement>();
  //     responseDTO.data = result;
  //     return responseDTO;
  //   });
  // }
}
