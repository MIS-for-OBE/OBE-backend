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
  async searchCourseManagement(
    @Request() req,
    @Query() searchDTO: any,
  ): Promise<ResponseDTO<CourseManagement[]>> {
    return this.service
      .searchCourseManagement(req.user.facultyCode, searchDTO)
      .then((result) => {
        const responseDTO = new ResponseDTO<CourseManagement[]>();
        responseDTO.data = result;
        return responseDTO;
      });
  }

  @Get('one')
  async searchOneCourseManagement(
    @Request() req,
    @Query() searchDTO: any,
  ): Promise<ResponseDTO<CourseManagement>> {
    return this.service.searchOneCourseManagement(searchDTO).then((result) => {
      const responseDTO = new ResponseDTO<CourseManagement>();
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

  @Post('section/:id')
  async createSectionManagement(
    @Param('id') id: string,
    @Body() requestDTO: any,
  ): Promise<ResponseDTO<any>> {
    return this.service
      .createSectionManagement(id, requestDTO)
      .then((result) => {
        const responseDTO = new ResponseDTO<any>();
        responseDTO.data = result;
        return responseDTO;
      });
  }

  @Put('ploMapping')
  async ploMapping(
    @Request() req,
    @Body() requestDTO: any,
  ): Promise<ResponseDTO<any>> {
    return this.service.ploMapping(req.user, requestDTO).then((result) => {
      const responseDTO = new ResponseDTO<any>();
      responseDTO.data = result;
      return responseDTO;
    });
  }

  @Put('coIns')
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
