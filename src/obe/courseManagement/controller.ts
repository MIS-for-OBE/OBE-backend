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
import { CourseManagementService } from './service';
import { CourseManagement, CourseManagementDocument } from './schemas/schema';

@Controller('/courseManagement')
@UsePipes(new ValidationPipe({ transform: true }))
export class CourseManagementController {
  constructor(private service: CourseManagementService) {}

  @Get()
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

  @Put('/:id')
  async updateCourseManagement(
    @Param('id') id: string,
    @Body() requestDTO: any,
  ): Promise<ResponseDTO<CourseManagement>> {
    return this.service
      .updateCourseManagement(id, requestDTO)
      .then((result) => {
        const responseDTO = new ResponseDTO<CourseManagement>();
        responseDTO.data = result;
        return responseDTO;
      });
  }

  @Delete('/:id')
  async deleteCourseManagement(
    @Param('id') id: string,
  ): Promise<ResponseDTO<CourseManagement>> {
    return this.service.deleteCourseManagement(id).then((result) => {
      const responseDTO = new ResponseDTO<CourseManagement>();
      responseDTO.data = result;
      return responseDTO;
    });
  }
}
