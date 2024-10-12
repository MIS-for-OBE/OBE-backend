import { CmuApiTqfCourseDTO } from 'src/common/cmu-api/cmu-api.dto';
import { Part4TQF3 } from '../schemas/tqf3.schema';
import { height } from 'pdfkit/js/page';
import { log } from 'console';

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
    .text('หมวดที่ 4 แผนการสอนและการประเมินผล', { align: 'center' })
    .moveDown(0.75);

  //Table
  {
    doc.font(fontBold).text('แผนการประเมินการเรียนรู้', 57, doc.y);

    doc.moveDown(0.75);

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
        evals.map((e) => e.percent + '%'),
      ];
    });

    const tableTop = doc.y + 0.6;
    const tableLeft = 50;
    const columnWidth = [170, 190, 70, 70];

    function calculateRowHeight(text, columnWidth) {
      const textHeight = doc.heightOfString(text, {
        width: columnWidth - 20,
      });
      return textHeight + 20;
    }

    const subRowHeight: any[] = [];

    const addPageIndex: any[] = [];

    const evalRow: any[] = [];
    const cloHeight: any[] = [];

    let temp = 600;
    let newTable = 0;

    //calculate eachEvalRowHeight
    {
      for (let index = 0; index < rows.length; index++) {
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
          let lastRow = 0;
          lastRow += rows[index][1].length;

          const maxHeight = Math.max(col1Height, col2Height, col3Height);
          subRowHeight.push({
            clo: index,
            height: maxHeight,
          });
        }
      }

      rows.forEach((row, cloIndex) => {
        row.forEach((cell, index) => {
          const eachRowHeight: any[] = [];
          subRowHeight.forEach((h) => {
            if (h.clo === cloIndex) {
              eachRowHeight.push(h);
            }
          });

          if (index === 1 && Array.isArray(cell)) {
            cell.forEach((_, i) => {
              let subCellHeight = 0;
              let sumOfCellRow = 0;
              subRowHeight.forEach((sum) => {
                if (sum.clo === cloIndex) {
                  sumOfCellRow += sum.height;
                }
              });

              if (cloHeight[cloIndex] > sumOfCellRow) {
                subCellHeight = cloHeight[cloIndex] / cell.length;
              } else if (cloHeight[cloIndex] <= sumOfCellRow) {
                subCellHeight = eachRowHeight[i].height;
              }

              evalRow.push({
                clo: row[0],
                cloIndex: `${cloIndex}`,
                order: i,
                height: subCellHeight,
              });
            });
          }
        });
      });
    }

    evalRow.forEach((e) => {
      if (e && typeof e.height === 'number') {
        newTable += e.height;

        if (newTable > temp) {
          const indexToPop = rows.findIndex((row) => row[0] === e.clo);
          let pageIndex = Number(e.cloIndex) + (e.order !== 0 && 1);
          addPageIndex.push(pageIndex);
          console.log('pageIndex', pageIndex);

          if (indexToPop !== -1) {
            const poppedItem = rows.splice(indexToPop, 1)[0];
            console.log('Popped Item:', poppedItem);

            if (e.order !== 0) {
              const newInstances = [
                [
                  poppedItem[0],
                  poppedItem[1].slice(0, e.order),
                  poppedItem[2].slice(0, e.order),
                  poppedItem[3].slice(0, e.order),
                ],
                [
                  ' ',
                  poppedItem[1].slice(e.order),
                  poppedItem[2].slice(e.order),
                  poppedItem[3].slice(e.order),
                ],
              ];

              rows.splice(indexToPop, 0, ...newInstances);
            }
          } else {
            console.log('No item to pop');
          }

          newTable = 0;
          temp = 750;
        }
      }
    });
    console.log(rows);

    //calculate eachEvalRowHeight
    {
      for (let index = 0; index < rows.length; index++) {
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
          let lastRow = 0;
          lastRow += rows[index][1].length;

          const maxHeight = Math.max(col1Height, col2Height, col3Height);
          subRowHeight.push({
            clo: index,
            height: maxHeight,
          });
        }
      }

      rows.forEach((row, cloIndex) => {
        row.forEach((cell, index) => {
          const eachRowHeight: any[] = [];
          subRowHeight.forEach((h) => {
            if (h.clo === cloIndex) {
              eachRowHeight.push(h);
            }
          });

          if (index === 1 && Array.isArray(cell)) {
            cell.forEach((_, i) => {
              let subCellHeight = 0;
              let sumOfCellRow = 0;
              subRowHeight.forEach((sum) => {
                if (sum.clo === cloIndex) {
                  sumOfCellRow += sum.height;
                }
              });

              if (cloHeight[cloIndex] > sumOfCellRow) {
                subCellHeight = cloHeight[cloIndex] / cell.length;
              } else if (cloHeight[cloIndex] <= sumOfCellRow) {
                subCellHeight = eachRowHeight[i].height;
              }

              evalRow.push({
                clo: row[0],
                cloIndex: `${cloIndex}`,
                order: i,
                height: subCellHeight,
              });
            });
          }
        });
      });
    }

    function drawSubTable(x, y, data, subTableWidth, col, cloIndex) {
      const eachRowHeight: any[] = [];
      subRowHeight.map((h) => {
        if (h.clo === cloIndex) {
          eachRowHeight.push(h);
        }
      });

      let subTableY = y;
      data.map((row, i) => {
        let subCellHeight = 0;
        let sumOfCellRow = 0;
        subRowHeight.forEach((sum) => {
          if (sum.clo === cloIndex) {
            sumOfCellRow += sum.height;
          }
        });

        if (cloHeight[cloIndex] > sumOfCellRow) {
          subCellHeight = cloHeight[cloIndex] / data.length;
        } else if (cloHeight[cloIndex] <= sumOfCellRow) {
          subCellHeight = eachRowHeight[i].height;
        }

        doc.rect(x, subTableY, subTableWidth, subCellHeight).stroke();

        doc.font(fontNormal).text(row, x + 12 + (col > 1 && 4), subTableY + 8, {
          width: subTableWidth - 30,
          align: col > 1 ? 'center' : 'left',
        });

        subTableY += subCellHeight;
      });
      return subTableY - y;
    }

    function drawRow(y, row, isHeader = false, cloIndex = null) {
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
            cloIndex,
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

        if (i === 0 || !Array.isArray(cell) || isHeader) {
          const lines = Array.isArray(cell) ? cell : [cell];
          const lineHeight = doc.heightOfString(lines[0]);

          lines.forEach((line, index) => {
            doc.text(
              line,
              tableLeft +
                columnWidth.slice(0, i).reduce((a, b) => a + b, 0) +
                18,
              y + 10 + (isHeader ? index * lineHeight : 0),
              {
                width: columnWidth[i] - 20,
                align: isHeader ? 'center' : 'left',
              },
            );
          });
        }
      });

      return rowHeight;
    }

    function drawHeaders() {
      drawRow(tableTop, headers, true);
    }

    function drawTable() {
      let currentY = tableTop + 63;
      console.log('addPageIndex', addPageIndex);

      rows.forEach((row, cloIndex) => {
        if (addPageIndex.includes(cloIndex)) {
          console.log(addPageIndex.includes(cloIndex));
          doc.addPage();
          currentY = doc.y;
        }
        const rowHeight = drawRow(currentY, row, false, cloIndex);
        currentY += rowHeight;
      });
    }

    drawHeaders();
    drawTable();
  }
};
