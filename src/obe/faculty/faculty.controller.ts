import {
  Body,
  Controller,
  Get,
  Post,
  Put,
  Request,
  UseInterceptors,
  UsePipes,
  ValidationPipe,
} from '@nestjs/common';
import { FacultyService } from './faculty.service';
import { ResponseDTO } from 'src/common/dto/response.dto';
import { Faculty } from './schemas/faculty.schema';
import { ErrorInterceptor } from 'src/common/interceptor/error.interceptor';

@Controller('/faculty')
@UseInterceptors(new ErrorInterceptor())
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
