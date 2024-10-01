import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { TQF3 } from './schemas/tqf3.schema';
import { Model } from 'mongoose';
import {
  COURSE_TYPE,
  EVALUATE_TYPE,
  TEACHING_METHOD,
  TQF_STATUS,
} from 'src/common/enum/type.enum';
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
      let data: CmuApiTqfCourseDTO = courseInfo.data[0];
      data = { ...data, ...requestDTO };
      const tqf3: any = await this.model.findById(requestDTO.tqf3);
      const date = moment().format('DD-MM-YYYY');
      const files = [];

      if (requestDTO.part1 !== undefined) {
        const filename = await this.generatePdfPart(1, date, {
          ...data,
          ...tqf3.part1._doc,
        });
        files.push(filename);
      }
      if (requestDTO.part2 !== undefined) {
        const filename = await this.generatePdfPart(2, date, {
          ...data,
          ...tqf3.part2._doc,
        });
        files.push(filename);
      }
      if (requestDTO.part3 !== undefined) {
        const filename = await this.generatePdfPart(3, date, {
          ...data,
          ...tqf3.part3._doc,
        });
        files.push(filename);
      }
      if (requestDTO.part4 !== undefined) {
        const filename = await this.generatePdfPart(4, date, {
          ...data,
          ...tqf3.part4._doc,
        });
        files.push(filename);
      }
      if (requestDTO.part5 !== undefined) {
        const filename = await this.generatePdfPart(5, date, {
          ...data,
          ...tqf3.part5._doc,
        });
        files.push(filename);
      }
      if (requestDTO.part6 !== undefined) {
        const filename = await this.generatePdfPart(6, date, {
          ...data,
          ...tqf3.part6._doc,
        });
        files.push(filename);
      }
      if (requestDTO.part7 !== undefined) {
        const filename = await this.generatePdfPart(7, date, {
          ...data,
          ...tqf3.part7?._doc,
        });
        files.push(filename);
      }

      return files;
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
          case 3:
            this.buildPart3Content(doc, font, data);
            break;
          case 4:
            this.buildPart4Content(doc, font, data);
            break;
          case 5:
            this.buildPart5Content(doc, font, data);
            break;
          case 6:
            this.buildPart6Content(doc, font, data);
            break;
          case 7:
            this.buildPart7Content(doc, font, data);
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

  private setSymbol(
    condition: boolean,
    type: 'checkbox' | 'radio' = 'checkbox',
  ) {
    if (type === 'radio') {
      return condition ? '◉' : '○';
    } else {
      return condition ? '☑' : '☐';
    }
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

    const labelX = 58;
    const column2 = 70;

    // Detail
    {
      doc
        .font(fontBold)
        .text('1. ชื่อสถาบันอุดมศึกษา', labelX, doc.y, { continued: true });
      doc.x = column2;
      doc
        .font(fontBold)
        .text('มหาวิทยาลัยเชียงใหม่ (CHIANG MAI UNIVERSITY)')
        .moveDown(0.6);

      // 2.
      doc
        .font(fontBold)
        .text('2. คณะ/ภาควิชา', labelX, doc.y, { continued: true });
      doc.x = column2 + 29; // Move to second column for the value
      doc
        .font(fontNormal)
        .text(`${data.FacultyNameTha}/ภาควิชาวิศวกรรมคอมพิวเตอร์`)
        .moveDown(0.6);
      doc.x = labelX + column2 + 29 + 12;
      doc
        .font(fontNormal)
        .text('Faculty of Engineering / Department Computer Engineering')
        .moveDown(0.6);

      // 3.
      doc
        .font(fontBold)
        .text('3. รหัสกระบวนวิชา', labelX, doc.y, { continued: true });
      doc.x = column2 + 17;
      doc
        .font(fontNormal)
        .text(
          `${data.CourseCodeTha} ${data.CourseID ? data.CourseID.slice(-3) : ''} `,
        )
        .moveDown(0.6);

      // Course title
      doc
        .font(fontBold)
        .text('ชื่อกระบวนวิชา', labelX + 12, doc.y, { continued: true });
      doc.x = column2 + 35;
      doc
        .font(fontNormal)
        .text(`${data.CourseTitleTha} (${data.CourseTitleEng})`)
        .moveDown(0.6);

      // 4.
      doc
        .font(fontBold)
        .text('4. หน่วยกิต', labelX, doc.y, { continued: true });
      doc.x = column2 + 29 + 22;
      doc.font(fontNormal).text(`${data.Credit}`).moveDown(0.6);
    }

    // Section: หมวดที่ 1 ข้อมูลทั่วไป
    doc
      .font(fontBold)
      .text('หมวดที่ 1 ข้อมูลทั่วไป', { align: 'center' })
      .moveDown(0.6);

    // Group 1.1
    {
      doc.text('1 หลักสูตรและประเภทของกระบวนวิชา').moveDown(0.6);
      doc.font(fontNormal).text('1.1', { continued: true });
      const curriculum = ['สำหรับหลักสูตร', 'สำหรับหลายหลักสูตร'];
      doc
        .font(emoji)
        .text(
          this.setSymbol(data.curriculum == curriculum[0]),
          doc.x + 9.5,
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
      doc.moveDown(0.6);
      doc.x += 20;
      doc
        .font(emoji)
        .text(
          this.setSymbol(
            [COURSE_TYPE.GENERAL, COURSE_TYPE.SPECIAL].includes(
              data.courseType,
            ),
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
    }

    // Group 1.2
    {
      doc
        .font(fontBold)
        .text('2. อาจารย์ผู้รับผิดชอบกระบวนวิชาและอาจารย์ผู้สอน')
        .moveDown(0.6);
      doc.x += 20;
      doc.text('2.1 ชื่ออาจารย์ผู้รับผิดชอบ').moveDown(0.6);
      doc.x += 15;
      doc
        .font(fontNormal)
        .text(`ผู้ช่วยศาสตราจารย์โดม โพธิกานนท์`)
        .moveDown(0.6);
      doc.x -= 15;
      doc.font(fontBold).text('2.2 อาจารย์ผู้สอน (ทุกคน)').moveDown(0.6);
      doc.x += 15;
      doc
        .font(fontNormal)
        .text(`ผู้ช่วยศาสตราจารย์โดม โพธิกานนท์`)
        .moveDown(0.6);
      doc
        .font(fontNormal)
        .text(`ผู้ช่วยศาสตราจารย์นิรันดร์ พิสุทธอานนท`)
        .moveDown(0.6);
      doc.x -= 35;
    }

    // Group 1.3
    {
      doc.font(fontBold).text('3. ภาคการศึกษา/ชั้นปีที่เรียน').moveDown(0.6);
      doc.x += 12;
      doc
        .font(fontNormal)
        .text(
          `ภาคการศึกษาที่ ${data.AcademicTerm} ชั้นปีที่ ${data.studentYear.join(',')}`,
        )
        .moveDown(0.6);
      doc.x -= 12;
    }

    // Group 1.4
    {
      doc.font(fontBold).text('4. สถานที่เรียน').moveDown(0.6);
      doc.x += 12;
      doc
        .font(emoji)
        .text(
          this.setSymbol(data.teachingLocation.in !== undefined),
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
          this.setSymbol(data.teachingLocation.out !== undefined),
          doc.x,
          doc.y - 2,
          { continued: true },
        );
      doc
        .font(fontNormal)
        .text(`นอกสถานที่ตั้งของมหาวิทยาลัยเชียงใหม่ `, doc.x + 5, doc.y + 2)
        .moveDown(0.6);
      doc.x -= 12;
    }

    // Group 1.5
    {
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

    // Section: หมวดที่ 2 ลักษณะและการดำเนินการ
    doc
      .font(fontBold, 14)
      .text('หมวดที่ 2 ลักษณะและการดำเนินการ', { align: 'center' })
      .moveDown(0.6);

    // Detail
    {
      doc.font(fontBold).text('ภาควิชาวิศวกรรมคอมพิวเตอร์', {
        align: 'left',
        continued: true,
      });

      doc.text(data.FacultyNameTha, {
        align: 'right',
      });
      doc.moveDown(0.6);

      doc
        .font(fontNormal)
        .text(
          `${data.CourseCodeTha} ${data.CourseID.slice(-3)} (${data.CourseID}) ${data.CourseTitleTha}`,
          {
            align: 'left',
            continued: true,
          },
        );

      doc.text(data.Credit, {
        align: 'right',
      });
      doc.moveDown(0.6);
    }

    // Teaching Method
    {
      // LEC
      doc.font(fontBold).text('โปรดระบุลักษณะกระบวนวิชา', {
        align: 'left',
        continued: true,
      });
      doc
        .font(emoji)
        .text(
          this.setSymbol(data.teachingMethod.includes(TEACHING_METHOD.LEC)),
          doc.x + 10,
          doc.y - 2,
          { continued: true },
        );
      doc
        .font(fontNormal)
        .text('บรรยาย', doc.x + 5, doc.y + 2, { continued: true });

      // LAB
      doc
        .font(emoji)
        .text(
          this.setSymbol(data.teachingMethod.includes(TEACHING_METHOD.LAB)),
          doc.x + 10,
          doc.y - 2,
          { continued: true },
        );
      doc
        .font(fontNormal)
        .text('ปฏิบัติการ', doc.x + 5, doc.y + 2, { continued: true });

      //PRAC
      doc
        .font(emoji)
        .text(
          this.setSymbol(data.teachingMethod.includes(TEACHING_METHOD.PRAC)),
          doc.x + 10,
          doc.y - 2,
          { continued: true },
        );
      doc
        .font(fontNormal)
        .text('ฝึกปฏิบัติ', doc.x + 5, doc.y + 2, { continued: true });

      //COOP
      doc
        .font(emoji)
        .text(
          this.setSymbol(data.teachingMethod.includes(TEACHING_METHOD.COOP)),
          doc.x + 10,
          doc.y - 2,
          { continued: true },
        );
      doc.font(fontNormal).text('สหกิจศึกษา', doc.x + 5, doc.y + 2);

      doc.moveDown(0.75);
    }

    // Evaluation
    {
      doc.font(fontBold).text('การวัดและประเมินผล', {
        align: 'left',
        continued: true,
      });

      // A-F
      doc
        .font(emoji)
        .text(
          this.setSymbol(data.evaluate === EVALUATE_TYPE.A_F, 'radio'),
          doc.x + 10,
          doc.y - 2,
          { continued: true },
        );
      doc
        .font(fontNormal)
        .text('A-F', doc.x + 5, doc.y + 2, { continued: true });

      //S/U
      doc
        .font(emoji)
        .text(
          this.setSymbol(data.evaluate === EVALUATE_TYPE.S_U, 'radio'),
          doc.x + 10,
          doc.y - 2,
          { continued: true },
        );
      doc
        .font(fontNormal)
        .text('S/U', doc.x + 5, doc.y + 2, { continued: true });

      //P
      doc
        .font(emoji)
        .text(
          this.setSymbol(data.evaluate === EVALUATE_TYPE.P, 'radio'),
          doc.x + 10,
          doc.y - 2,
          { continued: true },
        );
      doc.font(fontNormal).text('P', doc.x + 5, doc.y + 2);

      doc.moveDown(0.6);
    }

    // เงื่อนไขที่ต้องผ่านก่อน (Prerequisite Conditions)
    {
      doc.font(fontBold).text('เงื่อนไขที่ต้องผ่านก่อน', 55.5, doc.y, {
        continued: true,
      });

      doc.font(fontNormal).text(data.PreText, doc.x + 10, doc.y);

      doc.moveDown(0.6);
    }

    // คำอธิบายลักษณะกระบวนวิชา
    {
      doc.font(fontBold).text('คำอธิบายลักษณะกระบวนวิชา', doc.x, doc.y);
      doc.moveDown(0.75);

      doc
        .font(fontNormal)
        .text(data.CourseDescriptionTha, { indent: 40, lineGap: 2 });

      doc.moveDown(0.75);
    }

    // Course Learning Outcomes: CLO
    {
      doc
        .font(fontBold)
        .text(
          'ผลลัพธ์การเรียนรู้ของกระบวนวิชา (Course Learning Outcomes: CLO)  :  ',
          55.5,
          doc.y,
          { continued: true },
        );

      doc.font(fontNormal).text('นักศึกษาสามารถ', doc.x + 10, doc.y);
      doc.moveDown(0.75);

      // Table
      {
        const headers = ['ผลลัพธ์การเรียนรู้ (CLO)', 'วิธีการจัดการเรียนรู้'];

        const rows = data.clo.map((clo) => {
          let learningMethod = Array.isArray(clo.learningMethod)
            ? clo.learningMethod.slice()
            : [clo.learningMethod];

          if (learningMethod.includes('อื่นๆ (Other)') && clo.other) {
            learningMethod = learningMethod.filter(
              (method) => method !== 'อื่นๆ (Other)',
            );
            learningMethod.push(clo.other);
          }

          // return ['1', 0];

          return [`CLO ${clo.no}: ${clo.descTH}`, learningMethod.join('\n')];
        });

        const tableTop = doc.y + 0.6;
        const tableLeft = 50;
        const columnWidth = [375, 125];

        function calculateRowHeight(text, columnWidth) {
          const textHeight = doc.heightOfString(text, {
            width: columnWidth - 20,
          });
          return textHeight + 20;
        }

        function drawRow(y, row, isHeader = false) {
          let rowHeight = 0;

          row.forEach((cell, i) => {
            const cellHeight = calculateRowHeight(cell, columnWidth[i]);
            if (cellHeight > rowHeight) {
              rowHeight = cellHeight;
            }
          });

          doc.lineWidth(0.5);

          row.forEach((cell, i) => {
            doc
              .rect(
                tableLeft +
                  columnWidth.slice(0, i).reduce((a, b) => a + b, 0) +
                  6.5,
                y,
                columnWidth[i],
                rowHeight,
              )
              .stroke();

            if (isHeader) {
              doc.font(fontBold);
            } else {
              doc.font(fontNormal);
            }

            doc.text(
              cell,
              tableLeft +
                columnWidth.slice(0, i).reduce((a, b) => a + b, 0) +
                10 +
                8,
              y + 10,
              {
                width: columnWidth[i] - 20,
                align: isHeader ? 'center' : 'left',
              },
            );
          });

          return rowHeight;
        }

        function drawHeaders() {
          drawRow(tableTop, headers, true);
        }

        function drawTable() {
          let currentY = tableTop + 34.5;
          let totalTableHeight = 0; // to track total height of table

          rows.forEach((row) => {
            const rowHeight = drawRow(currentY, row);
            totalTableHeight += rowHeight; // adding row height to total table height
            currentY += rowHeight;
          });

          // Adjust doc.y by the table height
          doc.y = currentY;
          return totalTableHeight;
        }

        drawHeaders();
        const tableHeight = drawTable();

        // Adding 100pt space between tables
        doc.y -= 10;
      }
    }

    doc.addPage();

    // Course content
    {
      doc
        .font(fontBold)
        .text('เนื้อหากระบวนวิชา (Course Content)', 55.5, doc.y + 20);

      doc.moveDown(0.75);

      // Table
      {
        const headers = [
          ['สัปดาห์', 'ที่'],
          'เนื้อหากระบวนวิชา',
          ['จำนวนชั่วโมง', 'บรรยาย'],
          ['จำนวนชั่วโมง', 'ปฏิบัติ'],
        ];

        const rows = data.schedule.map((item) => {
          return [item.weekNo, item.topic, item.lecHour, item.labHour];
        });

        const tableTop = doc.y + 0.6;
        const tableLeft = 50;
        const columnWidth = [70, 230, 100, 100];

        function calculateRowHeight(text, columnWidth) {
          const textHeight = doc.heightOfString(text, {
            width: columnWidth - 20,
          });
          return textHeight + 20;
        }

        function drawRow(y, row, isHeader = false) {
          let rowHeight = 0;

          row.forEach((cell, i) => {
            const cellHeight = calculateRowHeight(cell, columnWidth[i]);
            if (cellHeight > rowHeight) {
              rowHeight = cellHeight;
            }
          });

          doc.lineWidth(0.5);

          row.forEach((cell, i) => {
            doc
              .rect(
                tableLeft +
                  columnWidth.slice(0, i).reduce((a, b) => a + b, 0) +
                  6.5,
                y,
                columnWidth[i],
                rowHeight,
              )
              .stroke();

            if (isHeader) {
              doc.font(fontBold);
            } else {
              doc.font(fontNormal);
            }

            const lines = Array.isArray(cell) ? cell : [cell];
            const lineHeight = doc.heightOfString(lines[0]);

            lines.forEach((line, index) => {
              doc.text(
                line,
                tableLeft +
                  columnWidth.slice(0, i).reduce((a, b) => a + b, 0) +
                  10 +
                  8,
                y + 10 + (isHeader && index * lineHeight),
                {
                  width: columnWidth[i] - 20,
                  align: isHeader ? 'center' : 'left',
                },
              );
            });
          });

          return rowHeight;
        }

        function drawHeaders() {
          drawRow(tableTop, headers, true);
        }

        function drawTable() {
          let currentY = tableTop + 49;
          rows.forEach((row) => {
            const rowHeight = drawRow(currentY, row);
            currentY += rowHeight;
          });
        }

        drawHeaders();
        drawTable();
      }
    }
  }

  private buildPart3Content(
    doc: PDFKit.PDFDocument,
    font: {
      fontNormal: string;
      fontBold: string;
      emoji: string;
    },
    data: CmuApiTqfCourseDTO & Record<string, any>,
  ) {
    const { fontNormal, fontBold, emoji } = font;

    // Section: หมวดที่ 3
    doc
      .font(fontBold, 14)
      .text('หมวดที่ 3 ', { align: 'center' })
      .moveDown(0.75);

    // Evaluation
    {
      doc.font(fontBold).text('การกำหนดเกรด (Grading)', {
        align: 'left',
        continued: true,
      });

      // A-F
      doc
        .font(emoji)
        .text(
          this.setSymbol(
            data.gradingPolicy === 'แบบอิงกลุ่ม (Norm-Referenced Grading)',
            'radio',
          ),
          doc.x + 10,
          doc.y - 2,
          { continued: true },
        );
      doc
        .font(fontNormal)
        .text('แบบอิงกลุ่ม (Norm-Referenced Grading)', doc.x + 5, doc.y + 2);

      doc.x += 115.5;
      doc.moveDown(0.75);
      // 2
      doc
        .font(emoji)
        .text(
          this.setSymbol(
            data.gradingPolicy === 'แบบอิงเกณฑ์ (Criterion-Referenced Grading)',
            'radio',
          ),
          doc.x + 10,
          doc.y - 2,
          { continued: true },
        );
      doc
        .font(fontNormal)
        .text(
          'แบบอิงเกณฑ์ (Criterion-Referenced Grading)',
          doc.x + 5,
          doc.y + 2,
        );
      doc.x -= 10;
      doc.moveDown(0.75);
      // 3
      doc
        .font(emoji)
        .text(
          this.setSymbol(
            data.gradingPolicy ===
              'แบบอิงเกณฑ์และอิงกลุ่ม (Criterion and Norm-Referenced Grading)',
            'radio',
          ),
          doc.x + 10,
          doc.y - 2,
          { continued: true },
        );
      doc
        .font(fontNormal)
        .text(
          'แบบอิงเกณฑ์และอิงกลุ่ม (Criterion and Norm-Referenced Grading)',
          doc.x + 5,
          doc.y + 2,
        );
    }

    // Course Syllabus Table
    {
      doc.font(fontBold).text('Course Syllabus', 57, doc.y);

      doc.moveDown(0.75);

      // Table
      {
        const headers = [
          ['ลำดับ', 'ที่'],
          'หัวข้อ',
          'รายละเอียด',
          ['สัดส่วน', 'ของการ', 'ประเมิน'],
        ];

        const rows = data.eval.map((eva) => {
          return [eva.no, eva.topicTH, eva.desc, eva.percent];
        });

        const tableTop = doc.y + 0.6;
        const tableLeft = 50;
        const columnWidth = [60, 130, 230, 70];

        // Calculates row height
        function calculateRowHeight(text, columnWidth) {
          const textHeight = doc.heightOfString(text, {
            width: columnWidth - 20,
          });
          return textHeight + 20;
        }

        // Draws each row
        function drawRow(y, row, isHeader = false) {
          let rowHeight = 0;

          // Calculate row height based on the tallest cell
          row.forEach((cell, i) => {
            const content = Array.isArray(cell) ? cell.join('\n') : cell;
            const cellHeight = calculateRowHeight(content, columnWidth[i]);
            if (cellHeight > rowHeight) {
              rowHeight = cellHeight;
            }
          });

          doc.lineWidth(0.5);

          // Draw each cell in the row
          row.forEach((cell, i) => {
            // Draw cell border
            doc
              .rect(
                tableLeft +
                  columnWidth.slice(0, i).reduce((a, b) => a + b, 0) +
                  8,
                y,
                columnWidth[i],
                rowHeight,
              )
              .stroke();

            // Set font style
            if (isHeader) {
              doc.font(fontBold);
            } else {
              doc.font(fontNormal);
            }

            const lines = Array.isArray(cell) ? cell : [cell];
            const lineHeight = doc.heightOfString(lines[0]);

            lines.forEach((line, index) => {
              doc.text(
                line,
                tableLeft +
                  columnWidth.slice(0, i).reduce((a, b) => a + b, 0) +
                  10 +
                  8,
                y + 10 + (isHeader && index * lineHeight),
                {
                  width: columnWidth[i] - 20,
                  align: isHeader ? 'center' : 'left',
                },
              );
            });
          });

          return rowHeight;
        }

        // Draw the headers
        function drawHeaders() {
          drawRow(tableTop, headers, true);
        }

        // Draw the table
        function drawTable() {
          let currentY = tableTop + 63;
          rows.forEach((row) => {
            const rowHeight = drawRow(currentY, row);
            currentY += rowHeight;
          });
        }

        drawHeaders();
        drawTable();
      }
    }
  }

  private buildPart4Content(
    doc: PDFKit.PDFDocument,
    font: {
      fontNormal: string;
      fontBold: string;
      emoji: string;
    },
    data: CmuApiTqfCourseDTO & Record<string, any>,
  ) {
    const { fontNormal, fontBold, emoji } = font;

    // Section: หมวดที่ 4
    doc
      .font(fontBold, 14)
      .text('หมวดที่ 4 การประเมินผลคะแนนกระบวนวิชา', { align: 'center' })
      .moveDown(0.75);

    // Course Syllabus Table
    {
      doc.font(fontBold).text('Course Syllabus', 57, doc.y);

      doc.moveDown(0.75);

      // Table
      // {
      //   const headers = [
      //     ['ลำดับ', 'ที่'],
      //     'หัวข้อ',
      //     'รายละเอียด',
      //     ['สัดส่วน', 'ของการ', 'ประเมิน'],
      //   ];

      //   const rows = data.eval.map((eva) => {
      //     return [eva.no, eva.topicTH, eva.desc, eva.percent];
      //   });

      //   const tableTop = doc.y + 0.6;
      //   const tableLeft = 50;
      //   const columnWidth = [60, 130, 230, 70];

      //   // Calculates row height
      //   function calculateRowHeight(text, columnWidth) {
      //     const textHeight = doc.heightOfString(text, {
      //       width: columnWidth - 20,
      //     });
      //     return textHeight + 20;
      //   }

      //   // Draws each row
      //   function drawRow(y, row, isHeader = false) {
      //     let rowHeight = 0;

      //     // Calculate row height based on the tallest cell
      //     row.forEach((cell, i) => {
      //       const content = Array.isArray(cell) ? cell.join('\n') : cell;
      //       const cellHeight = calculateRowHeight(content, columnWidth[i]);
      //       if (cellHeight > rowHeight) {
      //         rowHeight = cellHeight;
      //       }
      //     });

      //     doc.lineWidth(0.5);

      //     // Draw each cell in the row
      //     row.forEach((cell, i) => {
      //       // Draw cell border
      //       doc
      //         .rect(
      //           tableLeft +
      //             columnWidth.slice(0, i).reduce((a, b) => a + b, 0) +
      //             8,
      //           y,
      //           columnWidth[i],
      //           rowHeight,
      //         )
      //         .stroke();

      //       // Set font style
      //       if (isHeader) {
      //         doc.font(fontBold);
      //       } else {
      //         doc.font(fontNormal);
      //       }

      //       const lines = Array.isArray(cell) ? cell : [cell];
      //       const lineHeight = doc.heightOfString(lines[0]);

      //       lines.forEach((line, index) => {
      //         doc.text(
      //           line,
      //           tableLeft +
      //             columnWidth.slice(0, i).reduce((a, b) => a + b, 0) +
      //             10 +
      //             8,
      //           y + 10 + (isHeader && index * lineHeight),
      //           {
      //             width: columnWidth[i] - 20,
      //             align: isHeader ? 'center' : 'left',
      //           },
      //         );
      //       });
      //     });

      //     return rowHeight;
      //   }

      //   // Draw the headers
      //   function drawHeaders() {
      //     drawRow(tableTop, headers, true);
      //   }

      //   // Draw the table
      //   function drawTable() {
      //     let currentY = tableTop + 63;
      //     rows.forEach((row) => {
      //       const rowHeight = drawRow(currentY, row);
      //       currentY += rowHeight;
      //     });
      //   }

      //   drawHeaders();
      //   drawTable();
      // }
    }
  }

  private buildPart5Content(
    doc: PDFKit.PDFDocument,
    font: {
      fontNormal: string;
      fontBold: string;
      emoji: string;
    },
    data: CmuApiTqfCourseDTO & Record<string, any>,
  ) {
    const { fontNormal, fontBold, emoji } = font;

    // Section: หมวดที่ 5
    doc
      .font(fontBold, 14)
      .text('หมวดที่ 5 ทรัพยากรประกอบการเรียนการสอน', { align: 'center' })
      .moveDown(0.6);
    {
      doc.font(fontBold).text('1. ตำราและเอกสารหลัก').moveDown(0.4);
      doc.x += 10.5;
      doc.font(fontNormal).text(data.mainRef).moveDown(0.6);
    }

    {
      doc.x -= 10.5;
      doc.font(fontBold).text('2. เอกสารและข้อมูลแนะนำ').moveDown(0.4);
      doc.x += 10.5;
      doc.font(fontNormal).text(data.recDoc).moveDown(0.6);
    }
  }

  private buildPart6Content(
    doc: PDFKit.PDFDocument,
    font: {
      fontNormal: string;
      fontBold: string;
      emoji: string;
    },
    data: CmuApiTqfCourseDTO & Record<string, any>,
  ) {
    const { fontNormal, fontBold, emoji } = font;
    fontNormal;

    // Section: หมวดที่ 6
    doc
      .font(fontBold, 14)
      .text('หมวดที่ 6 การประเมินกระบวนวิชาการและกระบวนการปรับปรุง', {
        align: 'center',
      })
      .moveDown(0.8);

    // Course Syllabus Table
    {
      let topics = [
        {
          no: 1,
          en: 'Strategies for evaluating course effectiveness by students',
          th: 'กลยุทธ์การประเมินประสิทธิผลของกระบวนวิชาโดยนักศึกษา',
          list: [
            { label: 'ไม่มี (None)', labelTH: 'ไม่มี' },
            {
              label: 'แบบประเมินกระบวนวิชา \n(Course assessment form)',
              labelTH: 'แบบประเมินกระบวนวิชา',
            },
            {
              label:
                'การสนทนากลุ่มระหว่างผู้สอนและผู้เรียน \n(Instructor-student group discussion)',
              labelTH: 'การสนทนากลุ่มระหว่างผู้สอนและผู้เรียน',
            },
            {
              label:
                'การสะท้อนคิดจากพฤติกรรมของผู้เรียน \n(Student behavior reflection)',
              labelTH: 'การสะท้อนคิดจากพฤติกรรมของผู้เรียน',
            },
            {
              label:
                "ข้อเสนอแนะผ่านเวบบอร์ดที่อาจารย์ผู้สอนได้จัดทำเป็นช่องทางการสื่อสารกับนักศึกษา \n(Suggestions through the instructor's webboard for student communication.)",
              labelTH:
                'ข้อเสนอแนะผ่านเวบบอร์ดที่อาจารย์ผู้สอนได้จัดทำเป็นช่องทางการสื่อสารกับนักศึกษา',
            },
            { label: 'อื่นๆ (Other)', labelTH: 'อื่นๆ' },
          ],
        },
        {
          no: 2,
          en: 'Strategies for teaching assessment',
          th: 'กลยุทธ์การประเมินการสอน',
          list: [
            { label: 'ไม่มี (None)', labelTH: 'ไม่มี' },
            {
              label: 'แบบประเมินผู้สอน \n(Instructor evaluation form)',
              labelTH: 'แบบประเมินผู้สอน',
            },
            { label: 'ผลการสอบ \n(Examination results)', labelTH: 'ผลการสอบ' },
            {
              label:
                'การทวนสอบผลประเมินการเรียนรู้ \n(Review of assessment results)',
              labelTH: 'การทวนสอบผลประเมินการเรียนรู้',
            },
            {
              label:
                'การประเมินโดยคณะกรรมการประเมินข้อสอบ \n(Evaluation by the Exam Committee)',
              labelTH: 'การประเมินโดยคณะกรรมการประเมินข้อสอบ',
            },
            {
              label:
                'การสังเกตการณ์สอนของผู้ร่วมทีมการสอน \n(Teaching observation by Co-Instructor)',
              labelTH: 'การสังเกตการณ์สอนของผู้ร่วมทีมการสอน',
            },
            { label: 'อื่นๆ (Other)', labelTH: 'อื่นๆ' },
          ],
        },
        {
          no: 3,
          en: 'Examination improvement ',
          th: 'กลไกการปรับปรับปรุงการสอบ',
          list: [
            { label: 'ไม่มี (None)', labelTH: 'ไม่มี' },
            {
              label:
                'สัมมนาการจัดการเรียนการสอน \n(Teaching Management Seminar)',
              labelTH: 'สัมมนาการจัดการเรียนการสอน',
            },
            {
              label:
                'การวิจัยในและนอกชั้นเรียน \n(Research in and out of the classroom)',
              labelTH: 'การวิจัยในและนอกชั้นเรียน',
            },

            { label: 'อื่นๆ (Other)', labelTH: 'อื่นๆ' },
          ],
        },
        {
          no: 4,
          en: 'The process of reviewing the standards of student course achievement',
          th: 'กระบวนการทวนสอบมาตรฐานผลสัมฤทธิ์กระบวนวิชาของนักศึกษา',
          list: [
            { label: 'ไม่มี (None)', labelTH: 'ไม่มี' },
            {
              label:
                'มีการตั้งคณะกรรมการในสาขาวิชา ตรวจสอบผลการประเมินการเรียนรู้ของนักศึกษา โดยตรวจสอบข้อรายงาน วิธีการการให้คะแนนสอบ และการให้คะแนนพฤติกรรม \n(A department-specific committee reviews student assessments, reports, scoring methods and behavioral evaluations.)',
              labelTH:
                'มีการตั้งคณะกรรมการในสาขาวิชา ตรวจสอบผลการประเมินการเรียนรู้ของนักศึกษา โดยตรวจสอบข้อรายงาน วิธีการการให้คะแนนสอบ และการให้คะแนนพฤติกรรม',
            },
            {
              label:
                'การทวนสอบการให้คะแนนการตรวจผลงานของนักศึกษาโดยกรรมการวิชาการประจำภาควิชาและคณะ \n(Department and faculty committees review student grading.)',
              labelTH:
                'การทวนสอบการให้คะแนนการตรวจผลงานของนักศึกษาโดยกรรมการวิชาการประจำภาควิชาและคณะ',
            },
            {
              label:
                'การทวนสอบการให้คะแนนจาก การสุ่มตรวจผลงานของนักศึกษาโดยอาจารย์ หรือผู้ทรงคุณวุฒิอื่นๆ \n(Random grading checks by teachers or qualified reviewers.)',
              labelTH:
                'การทวนสอบการให้คะแนนจาก การสุ่มตรวจผลงานของนักศึกษาโดยอาจารย์ หรือผู้ทรงคุณวุฒิอื่นๆ',
            },
            { label: 'อื่นๆ (Other)', labelTH: 'อื่นๆ' },
          ],
        },
        {
          no: 5,
          en: 'Reviewing and planning to enhance course effectiveness',
          th: 'การดำเนินการทบทวนและการวางแผนปรับปรุงประสิทธิผลของกระบวนวิชา',
          list: [
            { label: 'ไม่มี (None)', labelTH: 'ไม่มี' },
            {
              label:
                'ปรับปรุงกระบวนวิชาในแต่ละปี ตามข้อเสนอแนะและผลการทวนสอบมาตรฐานผลสัมฤทธิ์ตามข้อ 4 \n(Improve the course annually based on recommendations and No.4 - The standard of student course achievement )',
              labelTH:
                'ปรับปรุงกระบวนวิชาในแต่ละปี ตามข้อเสนอแนะและผลการทวนสอบมาตรฐานผลสัมฤทธิ์ตามข้อ 4',
            },
            {
              label:
                'ปรับปรุงกระบวนวิชาในแต่ละปี ตามผลการประเมินผู้สอนโดยนักศึกษา \n(Improve the course annually based on instructor evaluations from students.)',
              labelTH:
                'ปรับปรุงกระบวนวิชาในแต่ละปี ตามผลการประเมินผู้สอนโดยนักศึกษา',
            },
            {
              label:
                'ปรับปรุงกระบวนวิชาช่วงเวลาการปรับปรุงหลักสูตร \n(Improving the course during the curriculum improvement period)',
              labelTH: 'ปรับปรุงกระบวนวิชาช่วงเวลาการปรับปรุงหลักสูตร',
            },
            { label: 'อื่นๆ (Other)', labelTH: 'ไม่มี' },
          ],
        },
      ];

      topics.forEach((item, index) => {
        if (index !== 0) doc.x += 15;

        doc.font(fontBold).text(`${item.no}. ${item.th}`, {
          align: 'left',
        });
        doc.moveDown(0.3);

        item.list.forEach((e, eIndex) => {
          const checkboxSymbol = this.setSymbol(
            data.data[index].detail.includes(e.label),
          );

          doc.font(emoji).text(checkboxSymbol, doc.x, doc.y);

          doc.font(fontNormal).text(e.labelTH, doc.x + 15, doc.y - 15.3, {
            align: 'left',
            lineGap: index === 3 && eIndex === 1 ? 6 : 0,
            continued: false,
          });

          doc.x -= 15;

          doc.moveDown(0.3);
        });

        if (data.data[index].detail.includes('อื่นๆ (Other)')) {
          doc.font(fontNormal).text(data.data[index].other, doc.x + 15, doc.y, {
            align: 'left',
            continued: false,
          });
          doc.x -= 15;
        }
        doc.moveDown(0.3);

        doc.x -= 15;
      });

      // Additional Topic

      doc.moveDown(0.3);
      if (data.data.length > 5) {
        data.data.slice(5).map((item, index) => {
          doc
            .font(fontBold)
            .text(`${6 + index}. ${item.topic}`, doc.x + 15, doc.y, {
              align: 'left',
              continued: false,
            });
          doc.x -= 15;
          doc.moveDown(0.4);
          doc.font(fontNormal).text(item.detail[0], doc.x + 26.5, doc.y, {
            align: 'left',
            continued: false,
          });
          doc.x -= 26.5;
          doc.moveDown(0.5);
        });
      }
    }
  }

  private buildPart7Content(
    doc: PDFKit.PDFDocument,
    font: {
      fontNormal: string;
      fontBold: string;
      emoji: string;
    },
    data: CmuApiTqfCourseDTO & Record<string, any>,
  ) {
    const { fontNormal, fontBold, emoji } = font;

    // Section: หมวดที่ 4
    doc
      .font(fontBold, 14)
      .text('หมวดที่ 7 ', { align: 'center' })
      .moveDown(0.6);

    // Course Syllabus Table
    {
      doc.font(fontBold).text('Course Syllabus', 57, doc.y);

      doc.moveDown(0.6);

      // Table
      // {
      //   const headers = [
      //     ['ลำดับ', 'ที่'],
      //     'หัวข้อ',
      //     'รายละเอียด',
      //     ['สัดส่วน', 'ของการ', 'ประเมิน'],
      //   ];

      //   const rows = data.eval.map((eva) => {
      //     return [eva.no, eva.topicTH, eva.desc, eva.percent];
      //   });

      //   const tableTop = doc.y + 0.6;
      //   const tableLeft = 50;
      //   const columnWidth = [60, 130, 230, 70];

      //   // Calculates row height
      //   function calculateRowHeight(text, columnWidth) {
      //     const textHeight = doc.heightOfString(text, {
      //       width: columnWidth - 20,
      //     });
      //     return textHeight + 20;
      //   }

      //   // Draws each row
      //   function drawRow(y, row, isHeader = false) {
      //     let rowHeight = 0;

      //     // Calculate row height based on the tallest cell
      //     row.forEach((cell, i) => {
      //       const content = Array.isArray(cell) ? cell.join('\n') : cell;
      //       const cellHeight = calculateRowHeight(content, columnWidth[i]);
      //       if (cellHeight > rowHeight) {
      //         rowHeight = cellHeight;
      //       }
      //     });

      //     doc.lineWidth(0.5);

      //     // Draw each cell in the row
      //     row.forEach((cell, i) => {
      //       // Draw cell border
      //       doc
      //         .rect(
      //           tableLeft +
      //             columnWidth.slice(0, i).reduce((a, b) => a + b, 0) +
      //             8,
      //           y,
      //           columnWidth[i],
      //           rowHeight,
      //         )
      //         .stroke();

      //       // Set font style
      //       if (isHeader) {
      //         doc.font(fontBold);
      //       } else {
      //         doc.font(fontNormal);
      //       }

      //       const lines = Array.isArray(cell) ? cell : [cell];
      //       const lineHeight = doc.heightOfString(lines[0]);

      //       lines.forEach((line, index) => {
      //         doc.text(
      //           line,
      //           tableLeft +
      //             columnWidth.slice(0, i).reduce((a, b) => a + b, 0) +
      //             10 +
      //             8,
      //           y + 10 + (isHeader && index * lineHeight),
      //           {
      //             width: columnWidth[i] - 20,
      //             align: isHeader ? 'center' : 'left',
      //           },
      //         );
      //       });
      //     });

      //     return rowHeight;
      //   }

      //   // Draw the headers
      //   function drawHeaders() {
      //     drawRow(tableTop, headers, true);
      //   }

      //   // Draw the table
      //   function drawTable() {
      //     let currentY = tableTop + 63;
      //     rows.forEach((row) => {
      //       const rowHeight = drawRow(currentY, row);
      //       currentY += rowHeight;
      //     });
      //   }

      //   drawHeaders();
      //   drawTable();
      // }
    }
  }
}
