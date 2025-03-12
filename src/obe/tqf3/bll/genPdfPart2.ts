import { CmuApiTqfCourseDTO } from 'src/common/cmu-api/cmu-api.dto';
import { TEACHING_METHOD, EVALUATE_TYPE } from 'src/common/enum/type.enum';
import { Part2TQF3 } from '../schemas/tqf3.schema';
import { setSymbol } from './setUpPdf';
import { height } from 'pdfkit/js/page';

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
        `${data.CourseCodeTha ?? ''} ${data.CourseID.slice(-3)} (${data.CourseID}) ${data.CourseTitleTha}`,
        {
          align: 'left',
          continued: true,
        },
      );

    if (data.Credit) {
      doc.text(data.Credit, doc.x, doc.y - 1, { align: 'right' });
    } else {
      doc.moveDown(0.9);
      doc.x -= 81;
    }

    doc.moveDown(0.6);
  }

  // Teaching Method
  {
    // LEC
    doc.font(fontBold).text('ลักษณะกระบวนวิชา', {
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
      .font(fontBold)
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
      .font(fontBold)
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
      .font(fontBold)
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
    doc.font(fontBold).text('สหกิจศึกษา', doc.x + 5, doc.y + 2);

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
    doc.font(fontBold).text('A-F', doc.x + 5, doc.y + 2, { continued: true });

    //S/U
    doc
      .font(emoji)
      .text(
        setSymbol(data.evaluate === EVALUATE_TYPE.S_U, 'radio'),
        doc.x + 10,
        doc.y - 2,
        { continued: true },
      );
    doc.font(fontBold).text('S/U', doc.x + 5, doc.y + 2, { continued: true });

    //P
    doc
      .font(emoji)
      .text(
        setSymbol(data.evaluate === EVALUATE_TYPE.P, 'radio'),
        doc.x + 10,
        doc.y - 2,
        { continued: true },
      );
    doc.font(fontBold).text('P', doc.x + 5, doc.y + 2);

    doc.moveDown(0.6);
  }

  // เงื่อนไขที่ต้องผ่านก่อน (Prerequisite Conditions)
  {
    doc.font(fontBold).text('เงื่อนไขที่ต้องผ่านก่อน', 55.5, doc.y, {
      continued: true,
    });

    doc.font(fontNormal).text(data.PreText ?? '-', doc.x + 10, doc.y);

    doc.moveDown(0.85);
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
        'ผลลัพธ์การเรียนรู้ของกระบวนวิชา (Course Learning Outcomes: CLO) : ',
        55.5,
        doc.y,
        { continued: true },
      );

    doc.font(fontNormal).text('นักศึกษาสามารถ', doc.x, doc.y);
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
        return [`CLO ${clo.no}: ${clo.descTH}`, learningMethod.join('\n')];
      });

      const tableTop = doc.y + 0.6;
      const tableLeft = 50;
      const columnWidth = [385, 115];

      function calculateRowHeight(text, columnWidth) {
        const textHeight = doc.heightOfString(text, {
          width: columnWidth - 28,
        });
        return textHeight + 20;
      }

      function drawRow(y, row, isHeader = false, height = false) {
        let rowHeight = 0;

        row.forEach((cell, i) => {
          const cellHeight = calculateRowHeight(cell, columnWidth[i]);
          if (cellHeight > rowHeight) {
            rowHeight = cellHeight;
          }
        });

        if (!height) {
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
                align: isHeader || i > 1 ? 'center' : 'left',
                wordSpacing: 1,
              },
            );
          });
        }
        return rowHeight;
      }

      function drawHeaders() {
        drawRow(tableTop, headers, true);
      }
      function drawTable() {
        let currentY = tableTop + 34.5; // Initial position

        const maxY = 780;

        if (currentY > maxY) {
          doc.addPage();
          currentY = 47;
        }
        rows.forEach((row) => {
          const rowHeight = drawRow(currentY, row, false, true);

          if (currentY + rowHeight > maxY) {
            doc.addPage();
            currentY = doc.y;
            drawRow(currentY, row);
          } else {
            drawRow(currentY, row);
          }

          currentY += rowHeight;
        });
        doc.y = currentY;
      }

      drawHeaders();
      const tableHeight = drawTable();

      doc.y -= 10;
    }
  }

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
        'บรรยาย',
        'ปฏิบัติ',
      ];

      let totalLec = 0;
      let totalLab = 0;
      const rows = data.schedule.map((item) => {
        totalLec += item.lecHour;
        totalLab += item.labHour;
        return [item.weekNo, item.topic, item.lecHour, item.labHour];
      });

      const tableTop = doc.y + 0.6;
      const tableLeft = 50;
      const columnWidth = [70, 300, 65, 65];
      const lastRowColumns = [
        { width: columnWidth[0] + columnWidth[1], offset: 0 },
        {
          width: columnWidth[2],
          offset: columnWidth[0] + columnWidth[1],
        },
        {
          width: columnWidth[3],
          offset: columnWidth[0] + columnWidth[1] + columnWidth[2],
        },
      ];

      function calculateRowHeight(text, columnWidth) {
        const textHeight = doc.heightOfString(text, {
          width: columnWidth - 20,
        });
        return textHeight + 20;
      }

      function drawRow(
        y,
        row,
        isHeader = false,
        isLastRow = false,
        height = false,
      ) {
        let rowHeight = 0;

        row.forEach((cell, i) => {
          const content = Array.isArray(cell) ? cell.join('\n') : cell;
          const cellHeight = calculateRowHeight(content, columnWidth[i]);
          if (cellHeight > rowHeight) {
            rowHeight = cellHeight;
          }
        });

        doc.lineWidth(0.5);

        let heightSubHeader = 0;
        if (!height) {
          row.forEach((cell, i) => {
            if (isHeader && i > 1) {
              rowHeight = rowHeight / 2;
              if (i === 2) {
                doc
                  .rect(
                    tableLeft +
                      columnWidth.slice(0, i).reduce((a, b) => a + b, 0) +
                      6.5,
                    y,
                    columnWidth[2] + columnWidth[3],
                    rowHeight,
                  )
                  .stroke();

                doc.text(
                  'จำนวนชั่วโมง',
                  tableLeft +
                    columnWidth.slice(0, i).reduce((a, b) => a + b, 0) +
                    6,
                  y + 5,
                  {
                    width: columnWidth[2] + columnWidth[3],
                    align: 'center',
                  },
                );
              }
              doc
                .rect(
                  tableLeft +
                    columnWidth.slice(0, i).reduce((a, b) => a + b, 0) +
                    6.5,
                  y + rowHeight,
                  columnWidth[i],
                  rowHeight,
                )
                .stroke();
              heightSubHeader = rowHeight;
              rowHeight = rowHeight * 2;
            } else {
              if (isLastRow) {
                lastRowColumns.forEach(({ width, offset }) => {
                  doc
                    .rect(tableLeft + offset + 6.5, y, width, rowHeight)
                    .stroke();
                });
              } else {
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
              }
            }

            doc.font(isHeader ? fontBold : fontNormal);

            const lines = Array.isArray(cell) ? cell : [cell];
            const lineHeight = doc.heightOfString(lines[0]);

            lines.forEach((line, index) => {
              let textLeftPosition =
                tableLeft +
                columnWidth.slice(0, i).reduce((a, b) => a + b, 0) +
                10 +
                8;

              let textWidth = columnWidth[i] - 20;

              if (isLastRow) {
                lastRowColumns.forEach(({ width, offset }, i) => {
                  let textLeftPosition = tableLeft + offset + 10 + 8;
                  let textWidth = width - 20;

                  doc.text(row[i], textLeftPosition, y + 10, {
                    width: textWidth,
                    align: 'center',
                  });
                });
              } else {
                doc.text(
                  line,
                  textLeftPosition,
                  y +
                    10 +
                    (isHeader && index * lineHeight) +
                    (isHeader && i > 1 && heightSubHeader - 5),
                  {
                    width: textWidth,
                    align: isHeader || i > 1 ? 'center' : 'left',
                  },
                );
              }
            });
          });
        }
        return rowHeight;
      }

      function drawHeaders() {
        drawRow(tableTop, headers, true);
      }

      function drawTable() {
        let currentY = tableTop + 49;
        const maxY = 780;
        if (currentY > maxY) {
          doc.addPage();
          currentY = 47;
        }
        rows.forEach((row) => {
          const rowHeight = drawRow(currentY, row, false, false, true);
          if (currentY + rowHeight > maxY) {
            console.log(currentY + rowHeight);

            doc.addPage();
            currentY = doc.y;
            drawRow(currentY, row);
          } else {
            drawRow(currentY, row);
          }

          currentY += rowHeight;
        });

        drawRow(currentY, ['รวม', totalLec, totalLab], false, true);
      }

      drawHeaders();
      drawTable();
    }
  }
};
