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
import { AcademicYearService } from './service';
import { AcademicYearSearchDTO } from './dto/search.dto';
import { AcademicYear } from './schemas/schema';

@Controller('/academicYear')
@UsePipes(new ValidationPipe({ transform: true }))
export class AcademicYearController {
  constructor(private service: AcademicYearService) {}

  @Get()
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
  async activeAcademicYear(
    @Request() req,
    @Param('id') id: string,
  ): Promise<ResponseDTO<AcademicYear>> {
    return this.service.activeAcademicYear(req.user.id, id).then((result) => {
      const responseDTO = new ResponseDTO<AcademicYear>();
      responseDTO.data = result;
      return responseDTO;
    });
  }

  @Delete('/:id')
  async deleteAcademicYear(
    @Param('id') id: string,
  ): Promise<ResponseDTO<AcademicYear>> {
    return this.service.deleteAcademicYear(id).then((result) => {
      const responseDTO = new ResponseDTO<AcademicYear>();
      responseDTO.data = result;
      return responseDTO;
    });
  }
}
