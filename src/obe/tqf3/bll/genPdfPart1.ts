import { CmuApiTqfCourseDTO } from 'src/common/cmu-api/cmu-api.dto';
import { COURSE_TYPE } from 'src/common/enum/type.enum';
import { Part1TQF3 } from '../schemas/tqf3.schema';
import { setSymbol } from './setUpPdf';

export const buildPart1Content = (
  doc: PDFKit.PDFDocument,
  font: {
    fontNormal: string;
    fontBold: string;
    emoji: string;
  },
  data: CmuApiTqfCourseDTO & Part1TQF3,
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
      .text(
        `${data.FacultyNameTha}${data.DepartmentNameTha ? `/${data.DepartmentNameTha}` : ''}`,
      )
      .moveDown(0.6);
    doc.x = labelX + column2 + 29 + 12;
    doc
      .font(fontNormal)
      .text(
        `${data.FacultyNameEng}${data.DepartmentNameEng ? ` / ${data.DepartmentNameEng}` : ''}`,
      )
      .moveDown(0.6);

    // 3.
    doc
      .font(fontBold)
      .text('3. รหัสกระบวนวิชา', labelX, doc.y, { continued: true });
    doc.x = column2 + 17;
    doc
      .font(fontNormal)
      .text(
        `${data.CourseCodeTha} ${data.CourseID ? data.CourseID.slice(-3) : ''} (${data.CourseID})`,
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
    if (data.Credit) {
      doc
        .font(fontBold)
        .text('4. หน่วยกิต', labelX, doc.y, { continued: true });
      doc.x = column2 + 29 + 22;
      doc.font(fontNormal).text(`${data.Credit}`).moveDown(0.6);
    }
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
    const checkCurriculum = data.curriculum.includes(curriculum[0]);
    doc.font(emoji).text(setSymbol(checkCurriculum), doc.x + 9.5, doc.y - 2, {
      continued: true,
    });
    doc
      .font(fontNormal)
      .text(
        checkCurriculum
          ? data.curriculum
          : 'สำหรับหลักสูตร..........  สาขาวิชา..........',
        doc.x + 5,
        doc.y + 2,
      );
    doc.moveDown(0.6);
    doc
      .font(emoji)
      .text(
        setSymbol(data.curriculum == curriculum[1]),
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
        setSymbol(
          data.courseType.some((type) =>
            [COURSE_TYPE.GENERAL, COURSE_TYPE.SPECIAL].includes(type),
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
        setSymbol(data.courseType.includes(COURSE_TYPE.SEL_TOPIC)),
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
        setSymbol(data.courseType.includes(COURSE_TYPE.FREE)),
        doc.x,
        doc.y - 2,
        {
          continued: true,
        },
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
    doc.font(fontNormal).text(data.mainInstructor).moveDown(0.6);
    doc.x -= 15;
    doc.font(fontBold).text('2.2 อาจารย์ผู้สอน (ทุกคน)').moveDown(0.6);
    doc.x += 15;
    data.instructors.forEach((e) => {
      doc.font(fontNormal).text(e).moveDown(0.6);
    });

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
    // in
    doc
      .font(emoji)
      .text(
        setSymbol(data.teachingLocation.in !== undefined),
        doc.x,
        doc.y - 2,
        { continued: true },
      );
    doc
      .font(fontNormal)
      .text(`ในสถานที่ตั้งของมหาวิทยาลัยเชียงใหม่ `, doc.x + 5, doc.y + 2)
      .moveDown(0.6);

    if (data.teachingLocation.in !== undefined) {
      doc
        .font(fontNormal)
        .text(data.teachingLocation.in, doc.x + 17, doc.y + 2)
        .moveDown(0.6);
      doc.x -= 17;
    }

    doc
      .font(emoji)
      .text(
        setSymbol(data.teachingLocation.out !== undefined),
        doc.x,
        doc.y - 2,
        { continued: true },
      );
    doc
      .font(fontNormal)
      .text(`นอกสถานที่ตั้งของมหาวิทยาลัยเชียงใหม่ `, doc.x + 5, doc.y + 2)
      .moveDown(0.6);
    if (data.teachingLocation.out !== undefined) {
      doc
        .font(fontNormal)
        .text(data.teachingLocation.out, doc.x + 17, doc.y + 2)
        .moveDown(0.6);
      doc.x -= 17;
    }
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
};
