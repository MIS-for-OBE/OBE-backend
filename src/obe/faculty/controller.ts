import {
  Body,
  Controller,
  Get,
  Post,
  Put,
  Request,
  UsePipes,
  ValidationPipe,
} from '@nestjs/common';
import { FacultyService } from './service';
import { ResponseDTO } from 'src/common/dto/response.dto';
import { Faculty } from './schemas/schema';

@Controller('/faculty')
@UsePipes(new ValidationPipe({ transform: true }))
export class FacultyController {
  constructor(private service: FacultyService) {}

  @Get()
  async getFaculty(@Request() req): Promise<ResponseDTO<Faculty>> {
    return this.service.getFaculty(req.user.facultyCode).then((result) => {
      const responseDTO = new ResponseDTO<any>();
      responseDTO.data = result;
      return responseDTO;
    });
  }
}
