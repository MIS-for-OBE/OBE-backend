import {
  Controller,
  Get,
  Query,
  Request,
  UsePipes,
  ValidationPipe,
} from '@nestjs/common';
import { SectionService } from '../section/service';
import { PLOService } from './service';
import { ResponseDTO } from 'src/common/dto/response.dto';
import { CourseManagement } from '../courseManagement/schemas/schema';

@Controller('/plo')
@UsePipes(new ValidationPipe({ transform: true }))
export class PLOController {
  constructor(private service: PLOService) {}

  @Get()
  async searchPLO(
    @Request() req,
    @Query() searchDTO: any,
  ): Promise<ResponseDTO<CourseManagement[]>> {
    return this.service
      .searchPLO(req.user.facultyCode, searchDTO)
      .then((result) => {
        const responseDTO = new ResponseDTO<CourseManagement[]>();
        responseDTO.data = result;
        return responseDTO;
      });
  }
}
