import {
  BadRequestException,
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Post,
  Query,
  Request,
  UseInterceptors,
} from '@nestjs/common';
import { ResponseDTO } from 'src/common/dto/response.dto';
import { LogEventService } from './logEvent.service';
import { ErrorInterceptor } from 'src/common/interceptor/error.interceptor';
import { LogEvent } from './schemas/logEvent.schema';
import { LogEventSearchDTO } from './dto/search.dto';
import { LogEventDTO } from './dto/dto';

@Controller('/logEvents')
export class LogEventController {
  constructor(private service: LogEventService) {}

  @Get()
  @UseInterceptors(new ErrorInterceptor())
  async searchAll(
    @Query() searchDTO: LogEventSearchDTO,
  ): Promise<ResponseDTO<LogEvent[]>> {
    return this.service.searchLogEvent(searchDTO).then((result) => {
      const responseDTO = new ResponseDTO<LogEvent[]>();
      responseDTO.data = result;
      return responseDTO;
    });
  }

  @Post()
  @UseInterceptors(new ErrorInterceptor())
  async createLogEvent(
    @Request() req,
    @Body() requestDTO: LogEventDTO,
  ): Promise<ResponseDTO<LogEvent>> {
    return this.service
      .createLogEvent(req.user.id, requestDTO)
      .then((result) => {
        const responseDTO = new ResponseDTO<LogEvent>();
        responseDTO.data = result;
        return responseDTO;
      });
  }
}
