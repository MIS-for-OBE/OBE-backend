import {
  Body,
  Controller,
  Delete,
  Param,
  Put,
  Query,
  UsePipes,
  ValidationPipe,
} from '@nestjs/common';
import { SectionService } from './section.service';
import { ResponseDTO } from 'src/common/dto/response.dto';
import { Section } from './schemas/section.schema';

@Controller('/section')
@UsePipes(new ValidationPipe({ transform: true }))
export class SectionController {
  constructor(private service: SectionService) {}

  @Put('/:id')
  async updateSection(
    @Param('id') id: string,
    @Body() requestDTO: any,
  ): Promise<ResponseDTO<Section>> {
    return this.service.updateSection(id, requestDTO).then((result) => {
      const responseDTO = new ResponseDTO<Section>();
      responseDTO.data = result;
      return responseDTO;
    });
  }

  @Put('/:id/active')
  async updateSectionActive(
    @Param('id') id: string,
    @Body() requestDTO: any,
  ): Promise<ResponseDTO<Section>> {
    return this.service.updateSectionActive(id, requestDTO).then((result) => {
      const responseDTO = new ResponseDTO<Section>();
      responseDTO.data = result;
      return responseDTO;
    });
  }

  @Delete('/:id')
  async deleteSection(
    @Param('id') id: string,
    @Query() reqestDTO: any,
  ): Promise<ResponseDTO<Section>> {
    return this.service.deleteSection(id, reqestDTO).then((result) => {
      const responseDTO = new ResponseDTO<Section>();
      responseDTO.data = result;
      return responseDTO;
    });
  }
}