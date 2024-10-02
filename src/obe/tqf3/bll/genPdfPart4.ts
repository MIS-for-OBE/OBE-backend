import { CmuApiTqfCourseDTO } from 'src/common/cmu-api/cmu-api.dto';
import { Part4TQF3 } from '../schemas/tqf3.schema';

export const buildPart4Content = (
  doc: PDFKit.PDFDocument,
  font: {
    fontNormal: string;
    fontBold: string;
    emoji: string;
  },
  data: CmuApiTqfCourseDTO & Part4TQF3,
) => {
  const { fontNormal, fontBold, emoji } = font;

  // Section: หมวดที่ 4
  doc
    .font(fontBold, 14)
    .text('หมวดที่ 4 การประเมินผลคะแนนกระบวนวิชา', { align: 'center' })
    .moveDown(0.75);

  //Table
  {
    // doc.font(fontBold).text('Course Syllabus', 57, doc.y);

    // doc.moveDown(0.75);

    const headers = [
      'ผลลัพธ์การเรียนรู้ (CLO)',
      'วิธีการประเมินผลการเรียนรู้',
      ['สัปดาห์', 'ที่ประเมิน'],
      ['สัดส่วน', 'ของการ', 'ประเมิน'],
    ];

    const rows = data.data.map(({ clo, evals }) => {
      return [
        `CLO: ${clo.no} ${clo.descTH}`,
        evals.map((e) => e.eval.topicTH),
        evals.map((e) => e.evalWeek),
        evals.map((e) => e.percent),
      ];
    });
    console.log(rows[3].map((e) => e));

    const tableTop = doc.y + 0.6;
    const tableLeft = 50;
    const columnWidth = [150, 200, 70, 70];

    function calculateRowHeight(text, columnWidth) {
      const textHeight = doc.heightOfString(text, {
        width: columnWidth - 20,
      });
      return textHeight + 20;
    }

    const subRowHeight: number[] = [];
    const cloHeight: number[] = [];

    for (let index = 1; index < rows.length; index++) {
      console.log('index : ', index);

      const maxHeightClo = calculateRowHeight(rows[index][0], columnWidth[0]);
      cloHeight.push(maxHeightClo);

      for (let i = 0; i < rows[index][1].length; i++) {
        const col1Height = calculateRowHeight(
          rows[index][1][i],
          columnWidth[1],
        );
        const col2Height = calculateRowHeight(
          rows[index][2][i],
          columnWidth[2],
        );
        const col3Height = calculateRowHeight(
          rows[index][3][i],
          columnWidth[3],
        );

        const maxHeight = Math.max(col1Height, col2Height, col3Height);
        subRowHeight.push(maxHeight);
      }
    }
    console.log('Max Heights for each rows:', subRowHeight);

    function drawSubTable(x, y, data, subTableWidth, col) {
      let subTableY = y;

      data.map((row, i) => {
        let subCellHeight = 0;

        subCellHeight = subRowHeight[i];
        doc.rect(x, subTableY, subTableWidth, subCellHeight).stroke();

        doc.font(fontNormal).text(row, x + 5, subTableY + 5, {
          width: subTableWidth - 10,
          align: col > 1 ? 'center' : 'left',
        });

        subTableY += subCellHeight;
      });

      return subTableY - y;
    }

    function drawRow(y, row, isHeader = false) {
      let rowHeight = 0;

      row.forEach((cell, i) => {
        let content = cell;

        if (i !== 0 && Array.isArray(cell) && !isHeader) {
          const subTableWidth = columnWidth[i];
          const subTableHeight = drawSubTable(
            tableLeft + columnWidth.slice(0, i).reduce((a, b) => a + b, 0) + 8,
            y,
            cell,
            subTableWidth,
            i,
          );

          rowHeight = Math.max(rowHeight, subTableHeight);
        } else {
          content = Array.isArray(cell) ? cell.join('\n') : cell;
          const cellHeight = calculateRowHeight(content, columnWidth[i]);
          if (cellHeight > rowHeight) {
            rowHeight = cellHeight;
          }
        }
      });

      row.forEach((cell, i) => {
        doc
          .rect(
            tableLeft + columnWidth.slice(0, i).reduce((a, b) => a + b, 0) + 8,
            y,
            columnWidth[i],
            rowHeight,
          )
          .stroke();

        doc.font(isHeader ? fontBold : fontNormal);

        if (
          (i === 1 || i === 2 || i === 3) &&
          Array.isArray(cell) &&
          !isHeader
        ) {
          // ถ้าคอลัมน์ที่ 2 เป็นตารางย่อย จะข้ามการเขียนข้อความเพราะเขียนไปแล้วในฟังก์ชัน drawSubTable
        } else {
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
        }
      });

      return rowHeight;
      doc.addPage();
    }

    function drawHeaders() {
      drawRow(tableTop, headers, true);
    }

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
};
