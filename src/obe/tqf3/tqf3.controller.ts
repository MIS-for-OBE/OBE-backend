import {
  Body,
  Controller,
  Get,
  Param,
  Post,
  Put,
  Query,
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

@Controller('/tqf3')
@UsePipes(new ValidationPipe({ transform: true }))
export class TQF3Controller {
  constructor(private service: TQF3Service) {}

  @Put('/:id/:part')
  async updateCourse(
    @Param() params: { id: string; part: string },
    @Body() requestDTO: any,
  ): Promise<ResponseDTO<TQF3>> {
    return this.service.saveEachPart(params, requestDTO).then((result) => {
      const responseDTO = new ResponseDTO<TQF3>();
      responseDTO.data = result;
      return responseDTO;
    });
  }

  @Get('pdf')
  async generatePDF(
    @Res() res: Response,
    @Query() requestDTO: GeneratePdfDTO,
  ): Promise<void> {
    try {
      const files = await this.service.generatePDF(requestDTO);
      // single file
      res.setHeader('Content-disposition', `attachment; filename=${files}`);
      res.setHeader('Content-type', 'application/pdf');

      res.sendFile(files, { root: process.cwd() }, (err) => {
        if (err) {
          throw err;
        }
        fs.unlinkSync(files);
      });

      // multiple file (.zip)
      // res.setHeader('Content-disposition', 'attachment; filename=TQF3.zip');
      // res.setHeader('Content-type', 'application/zip');
      // const archive = archiver('zip', {
      //   zlib: { level: 9 },
      // });
      // archive.on('error', (err) => {
      //   throw err;
      // });
      // res.on('close', () => {
      //   files.forEach((file) => fs.unlinkSync(file));
      // });
      // archive.pipe(res);
      // files.forEach((file) => {
      //   const filePath = join(process.cwd(), file);
      //   archive.file(filePath, { name: file });
      // });
      // await archive.finalize();
    } catch (error) {
      throw error;
    }
  }
}
