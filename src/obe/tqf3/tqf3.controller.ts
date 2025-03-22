import {
  Body,
  Controller,
  Get,
  HttpStatus,
  Param,
  Put,
  Query,
  Request,
  Res,
  UsePipes,
  ValidationPipe,
} from '@nestjs/common';
import { Response } from 'express';
import { TQF3Service } from './tqf3.service';
import { ResponseDTO } from 'src/common/dto/response.dto';
import { TQF3 } from './schemas/tqf3.schema';
import { GeneratePdfDTO } from './dto/dto';
import * as fs from 'fs';
import * as archiver from 'archiver';
import { join } from 'path';
import { Public } from 'src/auth/metadata/public.metadata';
import {
  ApiBody,
  ApiExtraModels,
  ApiOkResponse,
  ApiOperation,
  ApiQuery,
  ApiTags,
} from '@nestjs/swagger';
import {
  ApiErrorResponse,
  ApiSuccessResponse,
  ApiUnauthorizedErrorResponse,
} from 'src/common/decorators/response.decorator';
import { DESCRIPTION } from 'src/common/enum/text.enum';
import { ERROR_ENUM } from 'src/common/enum/error.enum';
import { exampleCourseReuseTQF3 } from 'src/common/example/example';

@ApiTags('TQF3')
@Controller('/tqf3')
@ApiExtraModels(TQF3)
@UsePipes(new ValidationPipe({ transform: true }))
export class TQF3Controller {
  constructor(private service: TQF3Service) {}

  @Get('reuse')
  @ApiOperation({
    summary: 'Get reused TQF3 for courses based on the search criteria',
  })
  @ApiSuccessResponse(null, exampleCourseReuseTQF3)
  @ApiUnauthorizedErrorResponse()
  async getCourseReuseTQF3(
    @Query() searchDTO: any,
  ): Promise<ResponseDTO<any[]>> {
    return this.service.getCourseReuseTQF3(searchDTO).then((result) => {
      const responseDTO = new ResponseDTO<any[]>();
      responseDTO.data = result;
      return responseDTO;
    });
  }

  @Put('reuse')
  @ApiOperation({ summary: 'Reuse TQF3 for a specific course' })
  @ApiBody({
    description: 'ID of the TQF3 that want to reuse and want to save',
    required: true,
    schema: {
      properties: {
        reuseId: { example: 'xxxxxxxxxxxxxxxx60f7' },
        id: { example: 'xxxxxxxxxxxxxxxx60f8' },
      },
    },
  })
  @ApiSuccessResponse(TQF3)
  @ApiUnauthorizedErrorResponse()
  async reuseTQF3(
    @Body() requestDTO: { reuseId: string; id: string },
  ): Promise<ResponseDTO<TQF3>> {
    return this.service.reuseTQF3(requestDTO).then((result) => {
      const responseDTO = new ResponseDTO<TQF3>();
      responseDTO.data = result;
      return responseDTO;
    });
  }

  @Put('/:id/:part')
  @ApiOperation({ summary: 'Save data for a specific part of TQF3' })
  @ApiQuery({
    name: 'id',
    description: 'ID of the TQF3',
    required: true,
  })
  @ApiQuery({
    name: 'part',
    description: 'Part of the TQF3 that want to save',
    required: true,
  })
  @ApiSuccessResponse(TQF3)
  @ApiUnauthorizedErrorResponse()
  @ApiErrorResponse(
    HttpStatus.NOT_FOUND,
    DESCRIPTION.NOT_FOUND,
    ERROR_ENUM.NOT_FOUND,
    'TQF3 not found',
  )
  async saveEachPart(
    @Param() params: { id: string; part: string },
    @Body() requestDTO: any,
  ): Promise<ResponseDTO<TQF3>> {
    return this.service.saveEachPart(params, requestDTO).then((result) => {
      const responseDTO = new ResponseDTO<TQF3>();
      responseDTO.data = result;
      return responseDTO;
    });
  }

  @Public()
  @Get('pdf')
  @ApiOperation({ summary: 'Generate PDF for TQF3 data' })
  @ApiOkResponse({ description: 'Get PDF TQF3' })
  async generatePDF(
    @Request() req,
    @Res() res: Response,
    @Query() requestDTO: GeneratePdfDTO,
  ): Promise<void> {
    try {
      const files = await this.service.generatePDF(
        req?.user?.facultyCode,
        requestDTO,
      );
      if (files.length === 1) {
        const filePath = join(process.cwd(), files[0]);
        res.setHeader(
          'Content-disposition',
          requestDTO.display
            ? `inline; filename="${files[0]}"`
            : `attachment; filename="${files[0]}"`,
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
