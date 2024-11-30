import {
  Body,
  Controller,
  Get,
  Param,
  Post,
  Put,
  Request,
  UsePipes,
  ValidationPipe,
} from '@nestjs/common';
import { TQF5Service } from './tqf5.service';
import { ResponseDTO } from 'src/common/dto/response.dto';
import { TQF5 } from './schemas/tqf5.schema';

@Controller('/tqf5')
@UsePipes(new ValidationPipe({ transform: true }))
export class TQF5Controller {
  constructor(private service: TQF5Service) {}

  @Post('/:id/change-method')
  async changeMethod(
    @Param() params: { id: string },
    @Body() requestDTO: any,
  ): Promise<ResponseDTO<TQF5>> {
    return this.service.changeMethod(params, requestDTO).then((result) => {
      const responseDTO = new ResponseDTO<TQF5>();
      responseDTO.data = result;
      return responseDTO;
    });
  }

  @Put('/:id/:part')
  async saveEachPart(
    @Param() params: { id: string; part: string },
    @Body() requestDTO: any,
  ): Promise<ResponseDTO<TQF5>> {
    return this.service.saveEachPart(params, requestDTO).then((result) => {
      const responseDTO = new ResponseDTO<TQF5>();
      responseDTO.data = result;
      return responseDTO;
    });
  }
}
