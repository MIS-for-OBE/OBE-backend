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
import { PLOService } from './plo.service';
import { ResponseDTO } from 'src/common/dto/response.dto';
import { PLO } from './schemas/plo.schema';
import { PLOSearchDTO } from './dto/search.dto';
import { Public } from 'src/auth/metadata/public.metadata';
import { ApiTags } from '@nestjs/swagger';

@ApiTags('PLO')
@Controller('/plo')
@UsePipes(new ValidationPipe({ transform: true }))
export class PLOController {
  constructor(private service: PLOService) {}

  @Public()
  @Get()
  async searchPLO(
    @Request() req,
    @Query() searchDTO: PLOSearchDTO,
  ): Promise<ResponseDTO<any>> {
    return this.service
      .searchPLO(req?.user?.facultyCode, searchDTO)
      .then((result) => {
        const responseDTO = new ResponseDTO<any>();
        responseDTO.data = result;
        return responseDTO;
      });
  }

  @Get('one')
  async seachOnePLO(
    @Request() req,
    @Query() searchDTO: PLOSearchDTO,
  ): Promise<ResponseDTO<any>> {
    return this.service
      .searchOnePLO(req.user.facultyCode, searchDTO)
      .then((result) => {
        const responseDTO = new ResponseDTO<any>();
        responseDTO.data = result;
        return responseDTO;
      });
  }

  @Get('check')
  async checkCanCreatePLO(@Query() requestDTO: any): Promise<ResponseDTO<any>> {
    return this.service.checkCanCreatePLO(requestDTO).then((result) => {
      const responseDTO = new ResponseDTO<any>();
      responseDTO.data = result;
      return responseDTO;
    });
  }

  @Post()
  async createPLO(@Body() requestDTO: any): Promise<ResponseDTO<any>> {
    return this.service.createPLO(requestDTO).then((result) => {
      const responseDTO = new ResponseDTO<any>();
      responseDTO.data = result;
      return responseDTO;
    });
  }

  @Put('/:id/no')
  async createPLONo(
    @Param('id') id: string,
    @Body() requestDTO: any,
  ): Promise<ResponseDTO<PLO>> {
    return this.service.createPLONo(id, requestDTO).then((result) => {
      const responseDTO = new ResponseDTO<PLO>();
      responseDTO.data = result;
      return responseDTO;
    });
  }

  @Put('/:id')
  async updatePLO(
    @Param('id') id: string,
    @Body() requestDTO: any,
  ): Promise<ResponseDTO<PLO>> {
    return this.service.updatePLO(id, requestDTO).then((result) => {
      const responseDTO = new ResponseDTO<PLO>();
      responseDTO.data = result;
      return responseDTO;
    });
  }

  @Delete('/:id')
  async deletePLO(@Param('id') id: string): Promise<ResponseDTO<PLO>> {
    return this.service.deletePLO(id).then((result) => {
      const responseDTO = new ResponseDTO<PLO>();
      responseDTO.data = result;
      return responseDTO;
    });
  }

  @Delete('/:id/no')
  async deletePLONo(
    @Param('id') id: string,
    @Query() requestDTO: any,
  ): Promise<ResponseDTO<PLO>> {
    return this.service.deletePLONo(id, requestDTO).then((result) => {
      const responseDTO = new ResponseDTO<PLO>();
      responseDTO.data = result;
      return responseDTO;
    });
  }
}
