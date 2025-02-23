import { Injectable } from '@nestjs/common';
import * as fs from 'fs';
import * as PDFDocument from 'pdfkit';
import { PDFDocument as PDFLibDocument } from 'pdf-lib';
import { join } from 'path';
import { buildPart1Content } from './genPdfPart1';
import { Part1TQF5Curriculum } from '../schemas/tqf5.schema';
import { setupFonts } from './setUpPdf';
import { Part4TQF3 } from 'src/obe/tqf3/schemas/tqf3.schema';

@Injectable()
export class GeneratePdfTqf5BLL {
  constructor() {}

  async generatePdf(
    part: number,
    date: string,
    data: Record<string, any>,
    tqf5: Record<string, any>,
    tqf3: Record<string, any>,
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
              tqf5 as Part1TQF5Curriculum,
              tqf3 as Part4TQF3,
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
