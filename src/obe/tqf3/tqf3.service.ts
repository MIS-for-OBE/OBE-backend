import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { TQF3 } from './schemas/tqf3.schema';
import { Model } from 'mongoose';
import { COURSE_TYPE, TQF_STATUS } from 'src/common/enum/type.enum';
import { GeneratePdfDTO } from './dto/dto';
import * as fs from 'fs';
import * as PDFDocument from 'pdfkit';
import { join } from 'path';
import * as puppeteer from 'puppeteer';
import * as ejs from 'ejs';
import * as moment from 'moment';
import axios from 'axios';
import {
  CmuApiTqfCourseDTO,
  CmuApiTqfCourseSearchDTO,
} from 'src/common/cmu-api/cmu-api.dto';

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
      const courseInfo = await axios.get(
        `${process.env.BASE_CMU_API}course-template`,
        {
          params: {
            courseid: requestDTO.courseNo,
            academicyear: requestDTO.academicYear,
            academicterm: requestDTO.academicTerm,
          } as CmuApiTqfCourseSearchDTO,
        },
      );
      const data: CmuApiTqfCourseDTO = courseInfo.data[0];
      const tqf3: any = await this.model.findById(requestDTO.tqf3);
      const date = moment().format('DD-MM-YYYY');
      const prefix = 'src/obe/tqf3/templates';
      const files = [];

      if (requestDTO.part1 !== undefined) {
        const filename = await this.generatePdfPart(1, date, {
          ...data,
          ...requestDTO,
          ...tqf3.part1._doc,
        });
        // const part1 = await this.generatePdfEachPart(
        //   1,
        //   prefix,
        //   `${prefix}/part1.html`,
        //   date,
        //   { ...data, ...tqf3.part1 },
        // );
        return filename; // single file
        files.push(filename);
      }
      if (requestDTO.part2 !== undefined) {
        const filename = await this.generatePdfPart(2, date, {
          ...data,
          ...requestDTO,
          ...tqf3.part2._doc,
        });
        return filename;
        files.push(filename);
      }

      return files; // multiple file
    } catch (error) {
      throw error;
    }
  }

  private async generatePdfPart(
    part: number,
    date: string,
    data: CmuApiTqfCourseDTO & Record<string, any>,
  ): Promise<string> {
    return new Promise((resolve, reject) => {
      try {
        const filename = `TQF3_Part${part}_${date}.pdf`;
        const filePath = join(process.cwd(), filename);

        const doc = new PDFDocument({
          size: 'A4',
          bufferPages: true,
          margins: { top: 47, bottom: 47, left: 57, right: 57 },
        });
        const writeStream = fs.createWriteStream(filePath);
        doc.pipe(writeStream);
        const font = this.setupFonts(doc);
        doc.initForm();
        switch (part) {
          case 1:
            this.buildPart1Content(doc, font, data);
            break;
          case 2:
            this.buildPart2Content(doc, font, data);
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

  private setupFonts(doc: PDFKit.PDFDocument) {
    const fontNormal = 'TH Niramit AS-normal';
    const fontBold = 'TH Niramit AS-bold';
    const emoji = 'Segoe UI Symbol';

    doc.registerFont(fontNormal, 'src/assets/fonts/TH Niramit AS Regular.ttf');
    doc.registerFont(fontBold, 'src/assets/fonts/TH Niramit AS Bold.ttf');
    doc.registerFont(emoji, 'src/assets/fonts/Segoe-UI-Symbol.ttf');

    return { fontNormal, fontBold, emoji };
  }

  private setSymbol(condition: boolean) {
    return condition ? '☑' : '☐';
  }

  private buildPart1Content(
    doc: PDFKit.PDFDocument,
    font: {
      fontNormal: string;
      fontBold: string;
      emoji: string;
    },
    data: CmuApiTqfCourseDTO & Record<string, any>,
  ) {
    const { fontNormal, fontBold, emoji } = font;
    // Title
    doc.font(fontBold, 16).text('มคอ 3', { align: 'center' });
    doc.moveDown(0.6);

    // Section: รายละเอียดของกระบวนวิชา
    doc
      .font(fontBold, 14)
      .text('รายละเอียดของกระบวนวิชา', { align: 'center' })
      .moveDown(0.6);

    // Details
    doc.text('1. ชื่อสถาบันอุดมศึกษา', { continued: true });
    doc.x += 10;
    doc.text('มหาวิทยาลัยเชียงใหม่ (CHIANG MAI UNIVERSITY)').moveDown(0.6);

    doc.text('2. คณะ/ภาควิชา', { continued: true });
    doc.x += 40;
    doc
      .font(fontNormal)
      .text(`${data.FacultyNameTha}/ภาควิชาวิศวกรรมคอมพิวเตอร์`)
      .moveDown(0.6);
    doc
      .text(
        ` Faculty of Engineering / Department Computer Engineering`,
        doc.x + 109,
      )
      .moveDown(0.6);
    doc.x -= 109;

    doc.font(fontBold).text('3. รหัสกระบวนวิชา', { continued: true });
    doc.x += 28;
    doc
      .font(fontNormal)
      .text(
        `${data.CourseCodeTha} ${data.CourseID.slice(-3)} (${data.CourseID})`,
      )
      .moveDown(0.6);
    doc.x += 12;
    doc.font(fontBold).text('ชื่อกระบวนวิชา', { continued: true });
    doc.x += 37;
    doc
      .font(fontNormal)
      .text(`${data.CourseTitleTha} (${data.CourseTitleEng})`)
      .moveDown(0.6);
    doc.x -= 12;

    doc.font(fontBold).text('4. หน่วยกิต', { continued: true });
    doc.x += 60;
    doc.font(fontNormal).text(`${data.Credit}`).moveDown(0.6);

    // Section: หมวดที่ 1 ข้อมูลทั่วไป
    doc
      .font(fontBold)
      .text('หมวดที่ 1 ข้อมูลทั่วไป', { align: 'center' })
      .moveDown(0.6);

    // Group 1.1
    doc.text('1 หลักสูตรและประเภทของกระบวนวิชา').moveDown(0.6);
    doc.font(fontNormal).text('1.1', { continued: true });
    const curriculum = ['สำหรับหลักสูตร', 'สำหรับหลายหลักสูตร'];
    doc
      .font(emoji)
      .text(
        this.setSymbol(data.curriculum == curriculum[0]),
        doc.x + 10,
        doc.y - 2,
        { continued: true },
      );
    doc
      .font(fontNormal)
      .text(
        'สำหรับหลักสูตร..........  สาขาวิชา..........',
        doc.x + 5,
        doc.y + 2,
      );
    doc.moveDown(0.6);
    doc
      .font(emoji)
      .text(
        this.setSymbol(data.curriculum == curriculum[1]),
        doc.x + 20,
        doc.y - 2,
        { continued: true },
      );
    doc.font(fontNormal).text('สำหรับหลายหลักสูตร', doc.x + 5, doc.y + 2);
    doc.moveDown(0.6);
    doc.x -= 20;
    doc.font(fontNormal).text('1.2 ประเภทของกระบวนวิชา');
    doc.x += 20;
    doc
      .font(emoji)
      .text(
        this.setSymbol(
          [COURSE_TYPE.GENERAL, COURSE_TYPE.SPECIAL].includes(data.courseType),
        ),
        doc.x,
        doc.y - 2,
        { continued: true },
      );
    doc
      .font(fontNormal)
      .text('วิชาศึกษาทั่วไป', doc.x + 5, doc.y + 2)
      .moveDown(0.6);
    doc
      .font(emoji)
      .text(
        this.setSymbol(data.courseType == COURSE_TYPE.SEL_TOPIC),
        doc.x,
        doc.y - 2,
        { continued: true },
      );
    doc
      .font(fontNormal)
      .text('วิชาเฉพาะ', doc.x + 5, doc.y + 2)
      .moveDown(0.6);
    doc
      .font(emoji)
      .text(
        this.setSymbol(data.courseType == COURSE_TYPE.FREE),
        doc.x,
        doc.y - 2,
        { continued: true },
      );
    doc
      .font(fontNormal)
      .text('วิชาเลือกเสรี', doc.x + 5, doc.y + 2)
      .moveDown(0.6);
    doc.x -= 20;

    // Group 1.2
    doc
      .font(fontBold)
      .text('2. อาจารย์ผู้รับผิดชอบกระบวนวิชาและอาจารย์ผู้สอน')
      .moveDown(0.6);
    doc.x += 20;
    doc.text('2.1 ชื่ออาจารย์ผู้รับผิดชอบ').moveDown(0.6);
    doc.x += 15;
    doc.font(fontNormal).text(`ผู้ช่วยศาสตราจารย์โดม โพธิกานนท์`).moveDown(0.6);
    doc.x -= 15;
    doc.font(fontBold).text('2.2 อาจารย์ผู้สอน (ทุกคน)').moveDown(0.6);
    doc.x += 15;
    doc.font(fontNormal).text(`ผู้ช่วยศาสตราจารย์โดม โพธิกานนท์`).moveDown(0.6);
    doc
      .font(fontNormal)
      .text(`ผู้ช่วยศาสตราจารย์นิรันดร์ พิสุทธอานนท`)
      .moveDown(0.6);
    doc.x -= 35;

    // Group 1.3
    doc.font(fontBold).text('3. ภาคการศึกษา/ชั้นปีที่เรียน').moveDown(0.6);
    doc.x += 12;
    doc
      .font(fontNormal)
      .text(
        `ภาคการศึกษาที่ ${data.AcademicTerm} ชั้นปีที่ ${data.studentYear.join(',')}`,
      )
      .moveDown(0.6);
    doc.x -= 12;

    // Group 1.4
    doc.font(fontBold).text('4. สถานที่เรียน').moveDown(0.6);
    doc.x += 12;
    doc
      .font(emoji)
      .text(
        this.setSymbol(data.teachingLocation.in.length > 0),
        doc.x,
        doc.y - 2,
        { continued: true },
      );
    doc
      .font(fontNormal)
      .text(`ในสถานที่ตั้งของมหาวิทยาลัยเชียงใหม่ `, doc.x + 5, doc.y + 2)
      .moveDown(0.6);
    doc
      .font(emoji)
      .text(
        this.setSymbol(data.teachingLocation.out.length > 0),
        doc.x,
        doc.y - 2,
        { continued: true },
      );
    doc
      .font(fontNormal)
      .text(`นอกสถานที่ตั้งของมหาวิทยาลัยเชียงใหม่ `, doc.x + 5, doc.y + 2)
      .moveDown(0.6);
    doc.x -= 12;

    // Group 0.6
    doc
      .font(fontBold)
      .text(
        '5. จำนวนชั่วโมงต่อสัปดาห์ที่อาจารย์จะให้คำปรึกษาและแนะนำทางวิชาการแก่นักศึกษา',
      )
      .moveDown(0.6);
    doc.x += 12;
    doc
      .font(fontNormal)
      .text(`เป็นรายบุคคล ${data.consultHoursWk} ชั่วโมงต่อสัปดาห์`);
  }

  private buildPart2Content(
    doc: PDFKit.PDFDocument,
    font: {
      fontNormal: string;
      fontBold: string;
      emoji: string;
    },
    data: CmuApiTqfCourseDTO & Record<string, any>,
  ) {
    const { fontNormal, fontBold, emoji } = font;
  }

  // private async generatePdfEachPart(
  //   part: number,
  //   prefixPath: string,
  //   path: string,
  //   date: string,
  //   data: any,
  // ): Promise<string> {
  //   return new Promise((resolve, reject) => {
  //     try {
  //       const filename = `TQF3_Part${part}_${date}.pdf`;
  //       const filePath = join(process.cwd(), filename);
  //       const htmlPath = join(process.cwd(), path);
  //       const htmlContent = fs.readFileSync(htmlPath, 'utf-8');
  //       const renderedHtml = ejs.render(htmlContent, { data });
  //       const doc = new PDFDocument({
  //         size: 'A4',
  //         bufferPages: true,
  //         margin: 50,
  //       });
  //       const writeStream = fs.createWriteStream(filePath);
  //       doc.pipe(writeStream);
  //       doc.registerFont(
  //         'TH Niramit AS',
  //         'src/assets/fonts/TH Niramit AS Regular.ttf',
  //       );
  //       doc.font('TH Niramit AS');

  //       doc.end();
  //       writeStream.on('finish', () => resolve(filename));
  //       writeStream.on('error', reject);
  //       // const browser = await puppeteer.launch({
  //       //   headless: 'shell',
  //       //   args: [
  //       //     '--font-render-hinting=none',
  //       //     '--fast-start',
  //       //     '--disable-extensions',
  //       //     '--no-sandbox',
  //       //     '--disable-web-security',
  //       //   ],
  //       // });
  //       // const page = await browser.newPage();
  //       // await page.setContent(renderedHtml, { waitUntil: 'domcontentloaded' });
  //       // await page.addStyleTag({ path: `${prefixPath}/style.css` });
  //       // await page.evaluateHandle('document.fonts.ready');
  //       // await page.pdf({
  //       //   path: filename,
  //       //   format: 'A4',
  //       //   margin: {
  //       //     top: '0.6in',
  //       //     left: '0.75in',
  //       //     right: '0.75in',
  //       //     bottom: '1.44in',
  //       //   },
  //       //   printBackground: true,
  //       // });
  //       // await browser.close();
  //       // return filename;
  //     } catch (error) {
  //       reject(error);
  //     }
  //   });
  // }
}
