import { CmuApiTqfCourseDTO } from 'src/common/cmu-api/cmu-api.dto';
import { TEACHING_METHOD, EVALUATE_TYPE } from 'src/common/enum/type.enum';
import { Part2TQF3 } from '../schemas/tqf3.schema';
import { setSymbol } from './setUpPdf';

export const buildPart2Content = (
  doc: PDFKit.PDFDocument,
  font: {
    fontNormal: string;
    fontBold: string;
    emoji: string;
  },
  data: CmuApiTqfCourseDTO & Part2TQF3,
) => {
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
        setSymbol(data.teachingMethod.includes(TEACHING_METHOD.LEC)),
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
        setSymbol(data.teachingMethod.includes(TEACHING_METHOD.LAB)),
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
        setSymbol(data.teachingMethod.includes(TEACHING_METHOD.PRAC)),
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
        setSymbol(data.teachingMethod.includes(TEACHING_METHOD.COOP)),
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
        setSymbol(data.evaluate === EVALUATE_TYPE.A_F, 'radio'),
        doc.x + 10,
        doc.y - 2,
        { continued: true },
      );
    doc.font(fontNormal).text('A-F', doc.x + 5, doc.y + 2, { continued: true });

    //S/U
    doc
      .font(emoji)
      .text(
        setSymbol(data.evaluate === EVALUATE_TYPE.S_U, 'radio'),
        doc.x + 10,
        doc.y - 2,
        { continued: true },
      );
    doc.font(fontNormal).text('S/U', doc.x + 5, doc.y + 2, { continued: true });

    //P
    doc
      .font(emoji)
      .text(
        setSymbol(data.evaluate === EVALUATE_TYPE.P, 'radio'),
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
};
