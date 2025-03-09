import { CmuApiTqfCourseDTO } from 'src/common/cmu-api/cmu-api.dto';
import { Part4TQF3 } from '../schemas/tqf3.schema';
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
  doc.font(fontBold).text('แผนการประเมินการเรียนรู้', 57, doc.y);

  buildTqf3Part4Table(doc, font, data);
};

export const buildTqf3Part4Table = (
  doc: PDFKit.PDFDocument,
  font: {
    fontNormal: string;
    fontBold: string;
    emoji: string;
  },
  data: Part4TQF3,
) => {
  const { fontNormal, fontBold } = font;
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
  const columnWidth = [190, 170, 70, 70];

  let subRowHeight: any[] = [];
  const addPageIndex: any[] = [];
  const evalRow: any[] = [];
  let cloHeight: any[] = [];

  function calculateRowHeight(text, columnWidth) {
    const textHeight = doc.heightOfString(text, {
      width: columnWidth - 28,
    });

    return textHeight + 20;
  }

  function findEachEvalRowHeight(rows, subRowHeight, cloHeight) {
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

        const maxHeight = Math.max(col1Height, col2Height, col3Height);

        subRowHeight.push({
          clo: index,
          height: maxHeight,
        });
      }
    }
  }

  findEachEvalRowHeight(rows, subRowHeight, cloHeight);

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

  function findMaxCharsForHeight(text, columnWidth, maxHeight) {
    let bestFitLength = text.length;

    while (bestFitLength > 0) {
      let testText = text.substring(0, bestFitLength);
      let testHeight = calculateRowHeight(testText, columnWidth);

      console.log('Checking length:', bestFitLength);
      console.log('maxHeight:', maxHeight);
      console.log('testHeight:', testHeight);

      if (
        (maxHeight - testHeight > 15 && testHeight < maxHeight) ||
        (testHeight === maxHeight && testHeight < 35 && maxHeight < 35)
      ) {
        return bestFitLength; // Return the first valid length
      }

      bestFitLength -= bestFitLength > 20 ? 20 : 1;
    }

    return 0; // If no substring fits, return 0
  }

  let temp = 600;
  let pageIndex = 0;
  let addIndexNewInstance = 0;
  let sumAllSubTable = 0;
  let previousCloIndex = null;
  let sumSubTable = 0;
  let difSpace = 25;

  evalRow.forEach((e, i) => {
    if (e && typeof e.height === 'number') {
      sumAllSubTable += e.height;

      if (e.cloIndex !== previousCloIndex) {
        sumSubTable = 0;
      }

      sumSubTable += e.height;
      const heightTextClo = calculateRowHeight(e.clo, columnWidth[0]);
      let leftSpace = temp - (sumAllSubTable - sumSubTable - e.height);
      if (leftSpace < 0) leftSpace = leftSpace * -1;
      console.log('leftSpace', leftSpace);
      console.log('heightTextClo', heightTextClo);

      // check
      if (sumAllSubTable >= temp) {
        const indexToPop = rows.findIndex((row) => row[0] === e.clo);

        // e !== 0 &&
        // heightTextClo > leftSpace &&
        // sumAllSubTable - e.height > leftSpace;

        pageIndex =
          Number(e.cloIndex) +
          (heightTextClo < leftSpace && e.order !== 0
            ? 1 + addIndexNewInstance
            : 0);

        addPageIndex.push(pageIndex);

        // if (isSeperateText) {
        //   const maxHeight = leftSpace;

        //   if (maxHeight < 0) maxHeight * -1;
        //   const maxChar = findMaxCharsForHeight(
        //     e.clo,
        //     columnWidth[0],
        //     maxHeight,
        //   );
        //   firstPart = e.clo.substring(0, maxChar);
        //   secondPart = e.clo.substring(maxChar);

        if (indexToPop !== -1) {
          if (heightTextClo < leftSpace && e.order !== 0) {
            const poppedItem = rows.splice(indexToPop, 1)[0];

            const newInstances = [
              [
                e.clo,

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
            addIndexNewInstance++;
            rows.splice(indexToPop, 0, ...newInstances);
          }
        }

        temp = 690;
        sumAllSubTable = e.height;
        sumSubTable = e.height;
      }

      previousCloIndex = e.cloIndex;
      difSpace = 35;
      pageIndex = 0;
    }
  });

  subRowHeight = [];
  cloHeight = [];
  findEachEvalRowHeight(rows, subRowHeight, cloHeight);

  function drawSubTable(
    x,
    y,
    data,
    subTableWidth,
    col,
    cloIndex,
    height = false,
  ) {
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

      if (!height) {
        doc.rect(x, subTableY, subTableWidth, subCellHeight).stroke();

        doc.font(fontNormal).text(row, x + 12 + (col > 1 && 4), subTableY + 8, {
          width: subTableWidth - 30,
          align: col > 1 ? 'center' : 'left',
        });
      }
      subTableY += subCellHeight;
    });
    return subTableY - y;
  }

  function drawRow(y, row, isHeader = false, cloIndex = null, height = false) {
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
          height,
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

    if (!height) {
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
    }

    return rowHeight;
  }

  function drawHeaders() {
    drawRow(tableTop, headers, true);
  }

  let currentY = tableTop + 63;
  let maxY = 800;
  function drawTable() {
    rows.forEach((row, cloIndex) => {
      const rowHeight = drawRow(currentY, row, false, cloIndex, true);
      // if (addPageIndex.includes(cloIndex)) {
      //   console.log('addPageIndex', addPageIndex);
      if (currentY + rowHeight > maxY) {
        doc.addPage();
        currentY = doc.y;
        drawRow(currentY, row, false, cloIndex);
      } else {
        drawRow(currentY, row, false, cloIndex);
      }

      currentY += rowHeight;
    });

    return currentY;
  }

  drawHeaders();
  drawTable();

  return currentY;
};
