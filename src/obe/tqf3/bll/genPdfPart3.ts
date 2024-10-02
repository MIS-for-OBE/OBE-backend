import { CmuApiTqfCourseDTO } from 'src/common/cmu-api/cmu-api.dto';
import { Part3TQF3 } from '../schemas/tqf3.schema';
import { setSymbol } from './setUpPdf';

export const buildPart3Content = (
  doc: PDFKit.PDFDocument,
  font: {
    fontNormal: string;
    fontBold: string;
    emoji: string;
  },
  data: CmuApiTqfCourseDTO & Part3TQF3,
) => {
  const { fontNormal, fontBold, emoji } = font;

  // Section: หมวดที่ 3
  doc.font(fontBold, 14).text('หมวดที่ 3 ', { align: 'center' }).moveDown(0.75);

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
        setSymbol(
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
        setSymbol(
          data.gradingPolicy === 'แบบอิงเกณฑ์ (Criterion-Referenced Grading)',
          'radio',
        ),
        doc.x + 10,
        doc.y - 2,
        { continued: true },
      );
    doc
      .font(fontNormal)
      .text('แบบอิงเกณฑ์ (Criterion-Referenced Grading)', doc.x + 5, doc.y + 2);
    doc.x -= 10;
    doc.moveDown(0.75);
    // 3
    doc
      .font(emoji)
      .text(
        setSymbol(
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

          doc.font(isHeader ? fontBold : fontNormal);

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
};
