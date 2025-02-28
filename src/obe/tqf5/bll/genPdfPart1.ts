import { Part1TQF5Curriculum } from '../schemas/tqf5.schema';
import { Part4TQF3 } from 'src/obe/tqf3/schemas/tqf3.schema';
import { buildTqf3Part4Table } from 'src/obe/tqf3/bll/genPdfPart4';

export const buildPart1Content = (
  doc: PDFKit.PDFDocument,
  font: {
    fontNormal: string;
    fontBold: string;
    emoji: string;
  },
  tqf5: Part1TQF5Curriculum,
  tqf3: Part4TQF3,
) => {
  const { fontNormal, fontBold, emoji } = font;
  const gradeTotals = {
    A: 0,
    Bplus: 0,
    B: 0,
    Cplus: 0,
    C: 0,
    Dplus: 0,
    D: 0,
    F: 0,
    W: 0,
    S: 0,
    U: 0,
    P: 0,
  };

  tqf5.courseEval.map((grade) => {
    gradeTotals.A += grade.A;
    gradeTotals.Bplus += grade.Bplus;
    gradeTotals.B += grade.B;
    gradeTotals.Cplus += grade.Cplus;
    gradeTotals.C += grade.C;
    gradeTotals.Dplus += grade.Dplus;
    gradeTotals.D += grade.D;
    gradeTotals.F += grade.F;
    gradeTotals.W += grade.W;
    gradeTotals.S += grade.S;
    gradeTotals.U += grade.U;
    gradeTotals.P += grade.P;
  });

  let totalReg =
    gradeTotals.A +
    gradeTotals.Bplus +
    gradeTotals.B +
    gradeTotals.Cplus +
    gradeTotals.C +
    gradeTotals.Dplus +
    gradeTotals.D +
    gradeTotals.F +
    gradeTotals.S +
    gradeTotals.U +
    gradeTotals.P;

  doc
    .font(fontBold, 14)
    .text('หมวดที่ 1 สรุปผลการจัดการเรียนการสอนของกระบวนวิชา', {
      align: 'center',
    })
    .moveDown(0.75);
  //  1
  doc
    .text(
      `1. จำนวนนักศึกษาที่ลงทะเบียนเรียน ${totalReg} คน (โดยไม่ได้รับอักษรลำดับชั้น W)`,
    )
    .moveDown(0.6);
  // 2
  doc.text('2 จำนวนนักศึกษาเมื่อสิ้นสุดภาคการศึกษา').moveDown(0.6);
  doc.x += 10;
  doc
    .font(fontNormal, 14)
    .text(`${totalReg - gradeTotals.F - gradeTotals.U - gradeTotals.P} คน`)
    .moveDown(0.6);
  // 3
  doc.x -= 10;
  doc
    .font(fontBold, 14)
    .text(
      `3 จำนวนนักศึกษาที่ถอนกระบวนวิชา ${gradeTotals.W} คน (ได้รับอักษรลำดับชั้น W)`,
    )
    .moveDown(0.6);
  // 4
  doc.text('4 การกระจายของระดับคะแนนและเกรด').moveDown(0.6);

  //Table

  let headers = ['ลำดับชั้น', 'ช่วงคะแนน', 'จำนวนคน', 'ร้อยละ'];

  const grades = ['A', 'B+', 'B', 'C+', 'C', 'D+', 'D', 'F', 'S', 'U'];

  let rows = grades.map((grade) => {
    const percent = (
      (gradeTotals[grade.replace('+', 'plus')] / totalReg) *
      100
    ).toFixed(2);

    return [
      grade,
      tqf5.gradingCriteria[grade.replace('+', 'plus')],
      gradeTotals[grade.replace('+', 'plus')],
      percent === '0.00' ? '0' : percent,
    ];
  });

  let tableTop = doc.y + 0.6;
  let tableLeft = 50;

  let columnWidth = [100, 260, 70, 70];

  let subRowHeight: any[] = [];
  let addPageIndex: any[] = [];
  let evalRow: any[] = [];
  let cloHeight: any[] = [];
  let tableNo = 2;

  function calculateRowHeight(text, columnWidth) {
    const textHeight = doc.heightOfString(text, { width: columnWidth - 28 });
    const rowHeight = 20;
    if (tableNo === 1) {
      return textHeight + rowHeight;
    } else if (tableNo === 2) {
      return Math.min(textHeight, doc.currentLineHeight()) + rowHeight;
    }
    return textHeight + rowHeight;
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

  let temp = 645;
  let addIndexNewInstance = 0;

  let newTable = 0;
  evalRow.forEach((e, i) => {
    if (e && typeof e.height === 'number') {
      newTable += e.height;

      if (newTable > temp) {
        const indexToPop = rows.findIndex((row) => row[0] === e.clo);
        let pageIndex =
          Number(e.cloIndex) +
          (e.order !== 0 ? 1 + addIndexNewInstance : addIndexNewInstance);
        addPageIndex.push(pageIndex);

        if (indexToPop !== -1) {
          if (e.order !== 0) {
            const poppedItem = rows.splice(indexToPop, 1)[0];

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

            temp = 755;
            addIndexNewInstance++;

            rows.splice(indexToPop, 0, ...newInstances);
          }
        }
        newTable = e.height;
      }
    }
  });

  subRowHeight = [];
  cloHeight = [];
  findEachEvalRowHeight(rows, subRowHeight, cloHeight);

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
            tableLeft + columnWidth.slice(0, i).reduce((a, b) => a + b, 0) + 18,
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
    let currentY = tableTop + (tableNo === 2 ? 34 : 63);

    rows.forEach((row, cloIndex) => {
      if (addPageIndex.includes(cloIndex)) {
        doc.addPage();
        currentY = doc.y;
      }

      const rowHeight = drawRow(currentY, row, false, cloIndex);
      currentY += rowHeight;
    });
  }

  drawHeaders();
  drawTable();

  doc.y += 22;
  doc.x += -440;

  doc.font(fontBold, 14).text('จำนวนนักศึกษาที่ได้รับอักษรลำดับขั้น I', {
    align: 'left',
    continued: true,
  });
  doc
    .font(fontNormal, 14)
    .text(`${0} คน`, doc.x + 4)
    .moveDown(0.6);

  doc.font(fontBold, 14).text('จำนวนนักศึกษาที่ได้รับอักษรลำดับขั้น P', {
    align: 'left',
    continued: true,
  });
  doc
    .font(fontNormal, 14)
    .text(`${0} คน`, doc.x + 4)
    .moveDown(0.6);

  doc.font(fontBold, 14).text('จำนวนนักศึกษาที่ได้รับอักษรลำดับขั้น V', {
    align: 'left',
    continued: true,
  });

  doc
    .font(fontNormal, 14)
    .text(`${0} คน`, doc.x + 4)
    .moveDown(0.6);

  doc.y += 0.6;
  // 5
  doc
    .font(fontBold, 14)
    .text('5. ปัจจัยที่ทำให้ระดับคะแนนผิดปกติ (ถ้ามี)', {
      align: 'left',
    })
    .moveDown(0.6);

  doc.x += 12;
  doc.font(fontNormal, 14).text(`${tqf5.abnormalScoreFactor}`).moveDown(0.6);
  doc.addPage();
  // 6
  doc
    .font(fontBold, 14)
    .text(
      '6. ความคลาดเคลื่อนจากแผนการประเมินผลการเรียนรู้ที่กำหนดไว้ในรายละเอียดกระบวนวิชา',
      {
        align: 'left',
      },
    )
    .moveDown(0.6);

  const currentY = buildTqf3Part4Table(doc, font, tqf3);

  if (doc.y + 50 > doc.page.height - doc.page.margins.bottom) {
    doc.addPage();
    doc.y = doc.page.margins.top + 40;
  } else {
    doc.y = currentY + 10;
  }

  doc.x = doc.page.margins.left;

  doc
    .font(fontBold, 14)
    .text('7. การทวนสอบผลสัมฤทธิ์ของนักศึกษา (ให้อ้างอิงจาก มคอ. 2 และ 3)', {
      align: 'left',
    });

  doc.x += 12;
  doc.font(fontNormal, 14).text(`${tqf5.reviewingSLO}`).moveDown(0.6);
};
