import {
  Body,
  Controller,
  Delete,
  Param,
  Post,
  Put,
  Query,
  UsePipes,
  ValidationPipe,
} from '@nestjs/common';
import { ScoreService } from './score.service';
import { ResponseDTO } from 'src/common/dto/response.dto';
import { Section } from '../course/schemas/course.schema';

@Controller('/score')
@UsePipes(new ValidationPipe({ transform: true }))
export class ScoreController {
  constructor(private service: ScoreService) {}

  @Post()
  async uploadScore(@Body() requestDTO: any): Promise<ResponseDTO<Section[]>> {
    return this.service.uploadScore(requestDTO).then((result) => {
      const responseDTO = new ResponseDTO<Section[]>();
      responseDTO.data = result;
      return responseDTO;
    });
  }

  @Put('publish')
  async publishScore(@Body() requestDTO: any): Promise<ResponseDTO<Section[]>> {
    return this.service.publishScore(requestDTO).then((result) => {
      const responseDTO = new ResponseDTO<Section[]>();
      responseDTO.data = result;
      return responseDTO;
    });
  }
}
