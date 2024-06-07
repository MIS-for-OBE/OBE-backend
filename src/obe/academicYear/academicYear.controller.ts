import {
  BadRequestException,
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Post,
  Put,
  Query,
  Request,
  UseInterceptors,
} from '@nestjs/common';
import { ResponseDTO } from 'src/common/dto/response.dto';
import { AcademicYearService } from './academicYear.service';
import { ErrorInterceptor } from 'src/common/interceptor/error.interceptor';
import { AcademicYearSearchDTO } from './dto/search.dto';
import {
  AcademicYear,
  AcademicYearDocument,
} from './schemas/academicYear.schema';

@Controller('/academicYears')
export class AcademicYearController {
  constructor(private service: AcademicYearService) {}

  @Get()
  @UseInterceptors(new ErrorInterceptor())
  async searchAll(
    @Query() searchDTO: AcademicYearSearchDTO,
  ): Promise<ResponseDTO<AcademicYear[]>> {
    return this.service.searchAcademicYear(searchDTO).then((result) => {
      const responseDTO = new ResponseDTO<AcademicYear[]>();
      responseDTO.data = result;
      return responseDTO;
    });
  }

  @Post()
  @UseInterceptors(new ErrorInterceptor())
  async createAcademicYear(
    @Request() req,
    @Body() requestDTO: AcademicYear,
  ): Promise<ResponseDTO<AcademicYear>> {
    return this.service
      .createAcademicYear(req.user.id, requestDTO)
      .then((result) => {
        const responseDTO = new ResponseDTO<AcademicYear>();
        responseDTO.data = result;
        return responseDTO;
      });
  }

  @Put('/:id')
  @UseInterceptors(new ErrorInterceptor())
  async activeAcademicYear(
    @Request() req,
    @Param('id') id: string,
  ): Promise<ResponseDTO<AcademicYear>> {
    return this.service
      .activeAcademicYear(req.user.id, id)
      .then((result) => {
        const responseDTO = new ResponseDTO<AcademicYear>();
        responseDTO.data = result;
        return responseDTO;
      });
  }

  @Delete('/:id')
  @UseInterceptors(new ErrorInterceptor())
  async deleteAcademicYear(
    @Param('id') id: string,
  ): Promise<ResponseDTO<AcademicYear>> {
    return this.service.deleteAcademicYear(id).then((result) => {
      if (!result) {
        throw new BadRequestException('AcademicYear not found.');
      }
      const responseDTO = new ResponseDTO<AcademicYear>();
      responseDTO.data = result;
      return responseDTO;
    });
  }
}
