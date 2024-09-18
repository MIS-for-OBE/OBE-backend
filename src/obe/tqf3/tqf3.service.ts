import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { TQF3 } from './schemas/tqf3.schema';
import { Model } from 'mongoose';
import { TQF_STATUS } from 'src/common/enum/type.enum';
import * as fs from 'fs';
import { join } from 'path';
import * as puppeteer from 'puppeteer';

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

  async generatePDF(): Promise<any> {
    try {
      const part1 = await this.generatePart1PDF();
      return part1;
    } catch (error) {}
  }

  private async generatePart1PDF(): Promise<string> {
    const htmlPath = join(process.cwd(), 'src/obe/tqf3/templates/part1.html');

    return new Promise(async (resolve, reject) => {
      try {
        const htmlContent = fs.readFileSync(htmlPath, 'utf8');
        const browser = await puppeteer.launch();
        const page = await browser.newPage();
        await page.setContent(htmlContent, { waitUntil: 'load' });

        await page.pdf({
          path: 'hn.pdf',
          format: 'A4',
          printBackground: true,
        });

        await browser.close();

        resolve('hn.pdf');
      } catch (error) {
        console.error('Error generating PDF:', error);
        reject(error);
      }
    });
  }
}
