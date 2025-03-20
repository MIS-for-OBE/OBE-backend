import {
  Body,
  Controller,
  Get,
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
import { ApiTags } from '@nestjs/swagger';

@ApiTags('TQF5')
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

  @Post('/:id/mapping-assignment')
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
