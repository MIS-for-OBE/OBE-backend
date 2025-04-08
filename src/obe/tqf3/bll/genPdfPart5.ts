import { CmuApiTqfCourseDTO } from 'src/common/cmu-api/cmu-api.dto';
import { Part5TQF3 } from '../schemas/tqf3.schema';

export const buildPart5Content = (
  doc: PDFKit.PDFDocument,
  font: {
    fontNormal: string;
    fontBold: string;
    emoji: string;
  },
  data: CmuApiTqfCourseDTO & Part5TQF3,
) => {
  const { fontNormal, fontBold, emoji } = font;

  // Section: หมวดที่ 5
  doc
    .font(fontBold, 14)
    .text('หมวดที่ 5 ทรัพยากรประกอบการเรียนการสอน', { align: 'center' })
    .moveDown(0.6);
  {
    doc.font(fontBold).text('1. ตำราและเอกสารหลัก').moveDown(0.4);
    doc.x += 10.5;
    doc
      .font(fontNormal)
      .text(data.mainRef ? data.mainRef : '-')
      .moveDown(0.75);
  }

  {
    doc.x -= 10.5;
    doc.font(fontBold).text('2. เอกสารและข้อมูลแนะนำ').moveDown(0.4);
    doc.x += 10.5;
    doc
      .font(fontNormal)
      .text(data.recDoc ? data.recDoc : '-')
      .moveDown(0.75);
  }
};
