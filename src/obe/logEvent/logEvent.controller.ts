// import {
//   Body,
//   Controller,
//   Delete,
//   Get,
//   Param,
//   Post,
//   Query,
//   Request,
//   UsePipes,
//   ValidationPipe,
// } from '@nestjs/common';
// import { ResponseDTO } from 'src/common/dto/response.dto';
// import { LogEventService } from './logEvent.service';
// import { LogEvent } from './schemas/logEvent.schema';
// import { LogEventSearchDTO } from './dto/search.dto';
// import { LogEventDTO } from './dto/dto';

// @Controller('/logEvents')
// @UsePipes(new ValidationPipe({ transform: true }))
// export class LogEventController {
//   constructor(private service: LogEventService) {}

//   @Get()
//   async searchAll(
//     @Query() searchDTO: LogEventSearchDTO,
//   ): Promise<ResponseDTO<LogEvent[]>> {
//     return this.service.searchLogEvent(searchDTO).then((result) => {
//       const responseDTO = new ResponseDTO<LogEvent[]>();
//       responseDTO.data = result;
//       return responseDTO;
//     });
//   }

//   @Post()
//   async createLogEvent(
//     @Request() req,
//     @Body() requestDTO: LogEventDTO,
//   ): Promise<ResponseDTO<LogEvent>> {
//     return this.service
//       .createLogEvent(req.user.id, requestDTO)
//       .then((result) => {
//         const responseDTO = new ResponseDTO<LogEvent>();
//         responseDTO.data = result;
//         return responseDTO;
//       });
//   }
// }
