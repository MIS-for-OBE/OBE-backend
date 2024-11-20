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
import { AcademicYearService } from './academicYear.service';
import { AcademicYearSearchDTO } from './dto/search.dto';
import { AcademicYear } from './schemas/academicYear.schema';

@Controller('/academic-year')
@UsePipes(new ValidationPipe({ transform: true }))
export class AcademicYearController {
  constructor(private service: AcademicYearService) {}

  @Get()
  async searchAcademicYear(
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
    @Body() requestDTO: AcademicYear,
  ): Promise<ResponseDTO<AcademicYear>> {
    return this.service.createAcademicYear(requestDTO).then((result) => {
      const responseDTO = new ResponseDTO<AcademicYear>();
      responseDTO.data = result;
      return responseDTO;
    });
  }

  @Put('/:id')
  async activeAcademicYear(
    @Param('id') id: string,
  ): Promise<ResponseDTO<AcademicYear>> {
    return this.service.activeAcademicYear(id).then((result) => {
      const responseDTO = new ResponseDTO<AcademicYear>();
      responseDTO.data = result;
      return responseDTO;
    });
  }

  // @Put('/:id/tqf')
  // async updateProcessTqf3(
  //   @Param('id') id: string,
  //   @Body() requestDTO: any,
  // ): Promise<ResponseDTO<AcademicYear>> {
  //   return this.service.updateProcessTqf3(id, requestDTO).then((result) => {
  //     const responseDTO = new ResponseDTO<AcademicYear>();
  //     responseDTO.data = result;
  //     return responseDTO;
  //   });
  // }

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
