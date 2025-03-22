import {
  Body,
  Controller,
  Get,
  HttpStatus,
  Param,
  Post,
  Put,
  Query,
  Request,
  Res,
  UsePipes,
  ValidationPipe,
} from '@nestjs/common';
import { Response } from 'express';
import { TQF5Service } from './tqf5.service';
import { ResponseDTO } from 'src/common/dto/response.dto';
import { TQF5 } from './schemas/tqf5.schema';
import { GeneratePdfDTO } from './dto/dto';
import * as fs from 'fs';
import * as archiver from 'archiver';
import { join } from 'path';
import {
  ApiBody,
  ApiExtraModels,
  ApiOkResponse,
  ApiOperation,
  ApiParam,
  ApiQuery,
  ApiTags,
} from '@nestjs/swagger';
import {
  ApiSuccessResponse,
  ApiUnauthorizedErrorResponse,
  ApiErrorResponse,
} from 'src/common/decorators/response.decorator';
import { ERROR_ENUM } from 'src/common/enum/error.enum';
import { DESCRIPTION } from 'src/common/enum/text.enum';
import { METHOD_TQF5, TQF_STATUS } from 'src/common/enum/type.enum';
import {
  exampleAssignmentsMap,
  exampleTqf5P1,
} from 'src/common/example-response/example.response';

@ApiTags('TQF5')
@Controller('/tqf5')
@ApiExtraModels(TQF5)
@UsePipes(new ValidationPipe({ transform: true }))
export class TQF5Controller {
  constructor(private service: TQF5Service) {}

  @Post('/:id/change-method')
  @ApiOperation({ summary: 'Change the method of a TQF5 document' })
  @ApiParam({ name: 'id', required: true, description: 'TQF5 document ID' })
  @ApiBody({
    description: 'Method of a TQF5 document',
    schema: { example: { method: METHOD_TQF5.SCORE_OBE } },
  })
  @ApiSuccessResponse(TQF5, {
    data: {
      id: 'xxxxxxxxxxxxxxxx6f73',
      status: TQF_STATUS.IN_PROGRESS,
      part1: exampleTqf5P1,
    },
  })
  @ApiUnauthorizedErrorResponse()
  @ApiErrorResponse(
    HttpStatus.NOT_FOUND,
    DESCRIPTION.NOT_FOUND,
    ERROR_ENUM.NOT_FOUND,
    'TQF5 not found',
  )
  async changeMethod(
    @Param() params: { id: string },
    @Body() requestDTO: { method: METHOD_TQF5 },
  ): Promise<ResponseDTO<TQF5>> {
    return this.service.changeMethod(params, requestDTO).then((result) => {
      const responseDTO = new ResponseDTO<TQF5>();
      responseDTO.data = result;
      return responseDTO;
    });
  }

  @Post('/:id/mapping-assignment')
  @ApiOperation({ summary: 'Map assignments to a TQF5 document' })
  @ApiParam({ name: 'id', required: true, description: 'TQF5 document ID' })
  @ApiBody({
    description: 'Request DTO containing assignment mappings',
    schema: { example: { assignments: exampleAssignmentsMap } },
  })
  @ApiSuccessResponse(TQF5, {
    data: {
      id: 'xxxxxxxxxxxxxxxx6f73',
      status: TQF_STATUS.IN_PROGRESS,
      part1: exampleTqf5P1,
      assignments: exampleAssignmentsMap,
    },
  })
  @ApiUnauthorizedErrorResponse()
  @ApiErrorResponse(
    HttpStatus.NOT_FOUND,
    DESCRIPTION.NOT_FOUND,
    ERROR_ENUM.NOT_FOUND,
    'TQF5 not found',
  )
  async mappingAssignments(
    @Param() params: { id: string },
    @Body() requestDTO: any,
  ): Promise<ResponseDTO<any>> {
    return this.service
      .mappingAssignments(params, requestDTO)
      .then((result) => {
        const responseDTO = new ResponseDTO<any>();
        responseDTO.data = result;
        return responseDTO;
      });
  }

  @Put('/:id/:part')
  @ApiOperation({ summary: 'Save data for a specific part of TQF5' })
  @ApiQuery({
    name: 'id',
    description: 'ID of the TQF5',
    required: true,
  })
  @ApiQuery({
    name: 'part',
    description: 'Part of the TQF5 that want to save',
    required: true,
  })
  @ApiSuccessResponse(TQF5)
  @ApiUnauthorizedErrorResponse()
  @ApiErrorResponse(
    HttpStatus.NOT_FOUND,
    DESCRIPTION.NOT_FOUND,
    ERROR_ENUM.NOT_FOUND,
    'TQF5 not found',
  )
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

  @Get('pdf')
  @ApiOperation({ summary: 'Generate PDF for TQF5 data' })
  @ApiOkResponse({ description: 'Get PDF TQF5' })
  async generatePDF(
    @Request() req,
    @Res() res: Response,
    @Query() requestDTO: GeneratePdfDTO,
  ): Promise<void> {
    try {
      const files = await this.service.generatePDF(
        req.user.facultyCode,
        requestDTO,
      );
      if (files.length === 1) {
        const filePath = join(process.cwd(), files[0]);
        res.setHeader(
          'Content-disposition',
          `attachment; filename="${files[0]}"`,
        );
        res.setHeader('Content-type', 'application/pdf');
        res.setHeader('Access-Control-Expose-Headers', 'Content-Disposition');
        const stream = fs.createReadStream(filePath);
        stream.pipe(res);
        stream.on('close', () => {
          fs.unlinkSync(filePath);
        });
      } else {
        res.setHeader(
          'Content-disposition',
          `attachment; filename="TQF3_Parts_${requestDTO.courseNo}_${requestDTO.academicTerm}${requestDTO.academicYear}.zip"`,
        );
        res.setHeader('Content-type', 'application/zip');
        res.setHeader('Access-Control-Expose-Headers', 'Content-Disposition');
        const archive = archiver('zip', { zlib: { level: 9 } });
        archive.on('error', (err) => {
          throw err;
        });
        res.on('close', () => {
          files.forEach((file) => fs.unlinkSync(file));
        });
        archive.pipe(res);
        files.forEach((file) => {
          const filePath = join(process.cwd(), file);
          const stats = fs.statSync(filePath);
          const bangkokOffset = 7 * 60 * 60 * 1000;
          const modifiedDate = new Date(stats.mtime.getTime() + bangkokOffset);
          archive.file(filePath, { name: file, date: modifiedDate });
        });
        await archive.finalize();
      }
    } catch (error) {
      throw error;
    }
  }
}
