import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { TQF3 } from './schemas/tqf3.schema';
import { Model } from 'mongoose';
import { TQF_STATUS } from 'src/common/enum/type.enum';
import * as fs from 'fs';
import { join } from 'path';
import * as puppeteer from 'puppeteer';
import * as moment from 'moment';
import { GeneratePdfDTO } from './dto/dto';

@Injectable()
export class TQF3Service {
  constructor(@InjectModel(TQF3.name) private readonly model: Model<TQF3>) {}

  async saveEachPart(
    params: { id: string; part: string },
    requestDTO: any,
  ): Promise<TQF3> {
    try {
      const updateTQF3 = await this.model.findByIdAndUpdate(
        params.id,
        {
          status:
            params.part == 'part6' ? TQF_STATUS.DONE : TQF_STATUS.IN_PROGRESS,
          [params.part]: requestDTO,
        },
        { new: true, fields: `status ${params.part} updatedAt` },
      );
      if (!updateTQF3) {
        throw new NotFoundException('TQF3 not found.');
      }
      return updateTQF3;
    } catch (error) {
      throw error;
    }
  }

  async generatePDF(requestDTO: GeneratePdfDTO): Promise<any> {
    try {
      console.log(requestDTO.part1, requestDTO.part3);

      const date = moment().format('DD-MM-YYYY');
      const prefix = 'src/obe/tqf3/templates';
      const files = [];
      if (requestDTO.part1 !== undefined) {
        const part1 = await this.generatePdfEachPart(
          1,
          `${prefix}/part1.html`,
          date,
        );
        files.push(part1);
      }
      if (requestDTO.part2 !== undefined) {
        const part2 = await this.generatePdfEachPart(
          2,
          `${prefix}/part2.html`,
          date,
        );
        files.push(part2);
      }

      return files;
    } catch (error) {
      throw error;
    }
  }

  private async generatePdfEachPart(
    part: number,
    path: string,
    date: string,
  ): Promise<string> {
    try {
      const htmlPath = join(process.cwd(), path);
      console.log(htmlPath);
      const htmlContent = fs.readFileSync(htmlPath, 'utf8');
      const browser = await puppeteer.launch();
      const page = await browser.newPage();
      await page.setContent(htmlContent, { waitUntil: 'load' });

      const filename = `TQF3_Part${part}_${date}.pdf`;
      await page.pdf({
        path: filename,
        format: 'A4',
        margin: {
          top: '1.0in',
          left: '0.75in',
          right: '0.75in',
          bottom: '1.44in',
        },
        printBackground: true,
      });
      await browser.close();
      return filename;
    } catch (error) {
      throw error;
    }
  }
}
