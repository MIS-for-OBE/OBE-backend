import { CmuApiTqfCourseDTO } from 'src/common/cmu-api/cmu-api.dto';
import { COURSE_TYPE } from 'src/common/enum/type.enum';
import { Part3TQF5 } from '../schemas/tqf5.schema';
import { setSymbol } from './setUpPdf';

export const buildPart3Content = (
  doc: PDFKit.PDFDocument,
  font: {
    fontNormal: string;
    fontBold: string;
    emoji: string;
  },
  data: Part3TQF5,
) => {
  const { fontNormal, fontBold, emoji } = font;
  // Title
  doc.font(fontBold, 16).text('มคอ 3', { align: 'center' });
  doc.moveDown(0.6);

  // Section: รายละเอียดของกระบวนวิชา
  doc
    .font(fontBold, 14)
    .text('รายละเอียดของกระบวนวิชา', { align: 'center' })
    .moveDown(0.7);

  const labelX = 58;
  const column2 = 70;

  // Section: หมวดที่ 1 ข้อมูลทั่วไป
  doc
    .font(fontBold)
    .text('หมวดที่ 1 ข้อมูลทั่วไป', { align: 'center' })
    .moveDown(0.6);

  // Group 1.1
};
