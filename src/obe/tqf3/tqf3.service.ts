import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { TQF3 } from './schemas/tqf3.schema';
import { Model } from 'mongoose';
import { TQF_STATUS } from 'src/common/enum/type.enum';
import { GeneratePdfDTO } from './dto/dto';
import * as fs from 'fs';
import * as PDFDocument from 'pdfkit';
import { join } from 'path';
import * as puppeteer from 'puppeteer';
import * as ejs from 'ejs';
import * as moment from 'moment';

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
      const tqf3 = await this.model.findById(requestDTO.tqf3);
      const date = moment().format('DD-MM-YYYY');
      const prefix = 'src/obe/tqf3/templates';
      const files = [];

      if (requestDTO.part1 !== undefined) {
        const part1 = await this.generatePdfEachPart(
          1,
          prefix,
          `${prefix}/part1.html`,
          date,
          tqf3.part1,
        );
        return part1; // single file
        files.push(part1);
      }
      if (requestDTO.part2 !== undefined) {
        const part2 = await this.generatePdfEachPart(
          2,
          prefix,
          `${prefix}/part2.html`,
          date,
          tqf3.part2,
        );
        files.push(part2);
      }

      return files; // multiple file
    } catch (error) {
      throw error;
    }
  }

  private async generatePdfEachPart(
    part: number,
    prefixPath: string,
    path: string,
    date: string,
    data: any,
  ): Promise<string> {
    try {
      const htmlPath = join(process.cwd(), path);
      const htmlContent = fs.readFileSync(htmlPath, 'utf8');
      const renderedHtml = ejs.render(htmlContent, { data });
      // const doc = new PDFDocument({
      //   size: 'A4',
      //   bufferPages: true,
      // });
      // doc.file(renderedHtml);

      const browser = await puppeteer.launch({
        args: ['--font-render-hinting=none'],
      });
      const page = await browser.newPage();
      await page.setContent(renderedHtml, { waitUntil: 'networkidle0' });
      await page.addStyleTag({ path: `${prefixPath}/style.css` });
      await page.evaluateHandle('document.fonts.ready');
      const filename = `TQF3_Part${part}_${date}.pdf`;
      await page.pdf({
        path: filename,
        format: 'A4',
        margin: {
          top: '0.5in',
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
