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
import { CourseManagementService } from './courseManagement.service';
import {
  CourseManagement,
  CourseManagementDocument,
} from './schemas/courseManagement.schema';
import { CourseManagementSearchDTO } from './dto/search.dto';
import { Public } from 'src/auth/metadata/public.metadata';
import { ApiTags } from '@nestjs/swagger';

@ApiTags('Course Management')
@Controller('/course-management')
@UsePipes(new ValidationPipe({ transform: true }))
export class CourseManagementController {
  constructor(private service: CourseManagementService) {}

  @Get()
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
  async searchOneCourseManagement(
    @Query() searchDTO: CourseManagementSearchDTO,
  ): Promise<ResponseDTO<any>> {
    return this.service.searchOneCourseManagement(searchDTO).then((result) => {
      const responseDTO = new ResponseDTO<any>();
      responseDTO.data = result;
      return responseDTO;
    });
  }

  @Post()
  async createCourseManagement(
    @Body() requestDTO: CourseManagementDocument,
  ): Promise<ResponseDTO<CourseManagement>> {
    return this.service.createCourseManagement(requestDTO).then((result) => {
      const responseDTO = new ResponseDTO<CourseManagement>();
      responseDTO.data = result;
      return responseDTO;
    });
  }

  @Get('check')
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
  async ploMapping(@Body() requestDTO: any): Promise<ResponseDTO<any>> {
    return this.service.ploMapping(requestDTO).then((result) => {
      const responseDTO = new ResponseDTO<any>();
      responseDTO.data = result;
      return responseDTO;
    });
  }

  @Put('co-instructor')
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
  async deleteCourseManagement(
    @Param('id') id: string,
    @Query() requestDTO: any,
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
  async deleteSectionManagement(
    @Param() params: any,
    @Query() requestDTO: any,
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
