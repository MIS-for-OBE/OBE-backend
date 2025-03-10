import { Injectable } from '@nestjs/common';
import * as fs from 'fs';
import * as PDFDocument from 'pdfkit';
import { PDFDocument as PDFLibDocument } from 'pdf-lib';
import { join } from 'path';
import { buildPart1Content } from './genPdfPart1';
import { buildPart2Content } from './genPdfPart2';
import { buildPart3Content } from './genPdfPart3';
import { buildPart4Content } from './genPdfPart4';
import { buildPart5Content } from './genPdfPart5';
import { buildPart6Content } from './genPdfPart6';
import { CmuApiTqfCourseDTO } from 'src/common/cmu-api/cmu-api.dto';
import {
  Part1TQF3,
  Part2TQF3,
  Part3TQF3,
  Part4TQF3,
  Part5TQF3,
  Part6TQF3,
} from '../schemas/tqf3.schema';
import { setupFonts } from './setUpPdf';

@Injectable()
export class GeneratePdfBLL {
  constructor() {}

  async generatePdf(
    part: number,
    date: string,
    data: CmuApiTqfCourseDTO & Record<string, any>,
  ): Promise<string> {
    return new Promise((resolve, reject) => {
      try {
        const filename = `TQF3_Part${part}_${data.academicTerm}${data.academicYear}_${date}.pdf`;
        const filePath = join(process.cwd(), filename);

        const doc = new PDFDocument({
          size: 'A4',
          bufferPages: true,
          margins: { top: 47, bottom: 47, left: 57, right: 57 },
        });
        const writeStream = fs.createWriteStream(filePath);
        doc.pipe(writeStream);
        const font = setupFonts(doc);
        doc.initForm();
        switch (part) {
          case 1:
            buildPart1Content(
              doc,
              font,
              data as CmuApiTqfCourseDTO & Part1TQF3,
            );
            break;
          case 2:
            buildPart2Content(
              doc,
              font,
              data as CmuApiTqfCourseDTO & Part2TQF3,
            );
            break;
          case 3:
            buildPart3Content(
              doc,
              font,
              data as CmuApiTqfCourseDTO & Part3TQF3,
            );
            break;
          case 4:
            buildPart4Content(
              doc,
              font,
              data as CmuApiTqfCourseDTO & Part4TQF3,
            );
            break;
          case 5:
            buildPart5Content(
              doc,
              font,
              data as CmuApiTqfCourseDTO & Part5TQF3,
            );
            break;
          case 6:
            buildPart6Content(
              doc,
              font,
              data as CmuApiTqfCourseDTO & Part6TQF3,
            );
            break;
        }
        doc.end();

        writeStream.on('finish', () => resolve(filename));
        writeStream.on('error', reject);
      } catch (error) {
        reject(error);
      }
    });
  }

  async mergePdfs(files: string[], outputFilename: string): Promise<string> {
    const pdfDoc = await PDFLibDocument.create();

    for (const file of files) {
      const filePath = join(process.cwd(), file);
      const existingPdfBytes = fs.readFileSync(filePath);
      const existingPdf = await PDFLibDocument.load(existingPdfBytes);
      const copiedPages = await pdfDoc.copyPages(
        existingPdf,
        existingPdf.getPageIndices(),
      );
      copiedPages.forEach((page) => pdfDoc.addPage(page));
    }

    const pdfBytes = await pdfDoc.save();
    const outputPath = join(process.cwd(), outputFilename);
    fs.writeFileSync(outputPath, pdfBytes);

    return outputFilename;
  }
}
