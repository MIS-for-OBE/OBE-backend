import {
  Body,
  Controller,
  Get,
  Param,
  Put,
  Query,
  Request,
  UsePipes,
  ValidationPipe,
} from '@nestjs/common';
import { PLOService } from './service';
import { ResponseDTO } from 'src/common/dto/response.dto';
import { PLO } from './schemas/schema';
import { PLOSearchDTO } from './dto/search.dto';

@Controller('/plo')
@UsePipes(new ValidationPipe({ transform: true }))
export class PLOController {
  constructor(private service: PLOService) {}

  @Get()
  async searchPLO(
    @Request() req,
    @Query() searchDTO: PLOSearchDTO,
  ): Promise<ResponseDTO<any>> {
    return this.service
      .searchPLO(req.user.facultyCode, searchDTO)
      .then((result) => {
        const responseDTO = new ResponseDTO<any>();
        responseDTO.data = result;
        return responseDTO;
      });
  }

  @Put('/:id')
  async updatePLO(
    @Request() req,
    @Param('id') id: string,
    @Body() requestDTO: any,
  ): Promise<ResponseDTO<PLO>> {
    return this.service.updatePLO(id, requestDTO).then((result) => {
      const responseDTO = new ResponseDTO<PLO>();
      responseDTO.data = result;
      return responseDTO;
    });
  }
}
