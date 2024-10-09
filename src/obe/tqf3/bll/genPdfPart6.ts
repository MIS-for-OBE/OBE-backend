import { CmuApiTqfCourseDTO } from 'src/common/cmu-api/cmu-api.dto';
import { Part6TQF3 } from '../schemas/tqf3.schema';
import { setSymbol } from './setUpPdf';

export const buildPart6Content = (
  doc: PDFKit.PDFDocument,
  font: {
    fontNormal: string;
    fontBold: string;
    emoji: string;
  },
  data: CmuApiTqfCourseDTO & Part6TQF3,
) => {
  const { fontNormal, fontBold, emoji } = font;
  fontNormal;

  // Section: หมวดที่ 6
  doc
    .font(fontBold, 14)
    .text('หมวดที่ 6 การประเมินกระบวนวิชาการและกระบวนการปรับปรุง', {
      align: 'center',
    })
    .moveDown(0.8);

  // Course Syllabus Table
  {
    let topics = [
      {
        no: 1,
        en: 'Strategies for evaluating course effectiveness by students',
        th: 'กลยุทธ์การประเมินประสิทธิผลของกระบวนวิชาโดยนักศึกษา',
        list: [
          { label: 'ไม่มี (None)', labelTH: 'ไม่มี' },
          {
            label: 'แบบประเมินกระบวนวิชา \n(Course assessment form)',
            labelTH: 'แบบประเมินกระบวนวิชา',
          },
          {
            label:
              'การสนทนากลุ่มระหว่างผู้สอนและผู้เรียน \n(Instructor-student group discussion)',
            labelTH: 'การสนทนากลุ่มระหว่างผู้สอนและผู้เรียน',
          },
          {
            label:
              'การสะท้อนคิดจากพฤติกรรมของผู้เรียน \n(Student behavior reflection)',
            labelTH: 'การสะท้อนคิดจากพฤติกรรมของผู้เรียน',
          },
          {
            label:
              "ข้อเสนอแนะผ่านเวบบอร์ดที่อาจารย์ผู้สอนได้จัดทำเป็นช่องทางการสื่อสารกับนักศึกษา \n(Suggestions through the instructor's webboard for student communication.)",
            labelTH:
              'ข้อเสนอแนะผ่านเวบบอร์ดที่อาจารย์ผู้สอนได้จัดทำเป็นช่องทางการสื่อสารกับนักศึกษา',
          },
          { label: 'อื่นๆ (Other)', labelTH: 'อื่นๆ' },
        ],
      },
      {
        no: 2,
        en: 'Strategies for teaching assessment',
        th: 'กลยุทธ์การประเมินการสอน',
        list: [
          { label: 'ไม่มี (None)', labelTH: 'ไม่มี' },
          {
            label: 'แบบประเมินผู้สอน \n(Instructor evaluation form)',
            labelTH: 'แบบประเมินผู้สอน',
          },
          { label: 'ผลการสอบ \n(Examination results)', labelTH: 'ผลการสอบ' },
          {
            label:
              'การทวนสอบผลประเมินการเรียนรู้ \n(Review of assessment results)',
            labelTH: 'การทวนสอบผลประเมินการเรียนรู้',
          },
          {
            label:
              'การประเมินโดยคณะกรรมการประเมินข้อสอบ \n(Evaluation by the Exam Committee)',
            labelTH: 'การประเมินโดยคณะกรรมการประเมินข้อสอบ',
          },
          {
            label:
              'การสังเกตการณ์สอนของผู้ร่วมทีมการสอน \n(Teaching observation by Co-Instructor)',
            labelTH: 'การสังเกตการณ์สอนของผู้ร่วมทีมการสอน',
          },
          { label: 'อื่นๆ (Other)', labelTH: 'อื่นๆ' },
        ],
      },
      {
        no: 3,
        en: 'Examination improvement ',
        th: 'กลไกการปรับปรับปรุงการสอบ',
        list: [
          { label: 'ไม่มี (None)', labelTH: 'ไม่มี' },
          {
            label: 'สัมมนาการจัดการเรียนการสอน \n(Teaching Management Seminar)',
            labelTH: 'สัมมนาการจัดการเรียนการสอน',
          },
          {
            label:
              'การวิจัยในและนอกชั้นเรียน \n(Research in and out of the classroom)',
            labelTH: 'การวิจัยในและนอกชั้นเรียน',
          },

          { label: 'อื่นๆ (Other)', labelTH: 'อื่นๆ' },
        ],
      },
      {
        no: 4,
        en: 'The process of reviewing the standards of student course achievement',
        th: 'กระบวนการทวนสอบมาตรฐานผลสัมฤทธิ์กระบวนวิชาของนักศึกษา',
        list: [
          { label: 'ไม่มี (None)', labelTH: 'ไม่มี' },
          {
            label:
              'มีการตั้งคณะกรรมการในสาขาวิชา ตรวจสอบผลการประเมินการเรียนรู้ของนักศึกษา โดยตรวจสอบข้อรายงาน วิธีการการให้คะแนนสอบ และการให้คะแนนพฤติกรรม \n(A department-specific committee reviews student assessments, reports, scoring methods and behavioral evaluations.)',
            labelTH:
              'มีการตั้งคณะกรรมการในสาขาวิชา ตรวจสอบผลการประเมินการเรียนรู้ของนักศึกษา โดยตรวจสอบข้อรายงาน วิธีการการให้คะแนนสอบ และการให้คะแนนพฤติกรรม',
          },
          {
            label:
              'การทวนสอบการให้คะแนนการตรวจผลงานของนักศึกษาโดยกรรมการวิชาการประจำภาควิชาและคณะ \n(Department and faculty committees review student grading.)',
            labelTH:
              'การทวนสอบการให้คะแนนการตรวจผลงานของนักศึกษาโดยกรรมการวิชาการประจำภาควิชาและคณะ',
          },
          {
            label:
              'การทวนสอบการให้คะแนนจาก การสุ่มตรวจผลงานของนักศึกษาโดยอาจารย์ หรือผู้ทรงคุณวุฒิอื่นๆ \n(Random grading checks by teachers or qualified reviewers.)',
            labelTH:
              'การทวนสอบการให้คะแนนจาก การสุ่มตรวจผลงานของนักศึกษาโดยอาจารย์ หรือผู้ทรงคุณวุฒิอื่นๆ',
          },
          { label: 'อื่นๆ (Other)', labelTH: 'อื่นๆ' },
        ],
      },
      {
        no: 5,
        en: 'Reviewing and planning to enhance course effectiveness',
        th: 'การดำเนินการทบทวนและการวางแผนปรับปรุงประสิทธิผลของกระบวนวิชา',
        list: [
          { label: 'ไม่มี (None)', labelTH: 'ไม่มี' },
          {
            label:
              'ปรับปรุงกระบวนวิชาในแต่ละปี ตามข้อเสนอแนะและผลการทวนสอบมาตรฐานผลสัมฤทธิ์ตามข้อ 4 \n(Improve the course annually based on recommendations and No.4 - The standard of student course achievement )',
            labelTH:
              'ปรับปรุงกระบวนวิชาในแต่ละปี ตามข้อเสนอแนะและผลการทวนสอบมาตรฐานผลสัมฤทธิ์ตามข้อ 4',
          },
          {
            label:
              'ปรับปรุงกระบวนวิชาในแต่ละปี ตามผลการประเมินผู้สอนโดยนักศึกษา \n(Improve the course annually based on instructor evaluations from students.)',
            labelTH:
              'ปรับปรุงกระบวนวิชาในแต่ละปี ตามผลการประเมินผู้สอนโดยนักศึกษา',
          },
          {
            label:
              'ปรับปรุงกระบวนวิชาช่วงเวลาการปรับปรุงหลักสูตร \n(Improving the course during the curriculum improvement period)',
            labelTH: 'ปรับปรุงกระบวนวิชาช่วงเวลาการปรับปรุงหลักสูตร',
          },
          { label: 'อื่นๆ (Other)', labelTH: 'ไม่มี' },
        ],
      },
    ];

    topics.forEach((item, index) => {
      if (index !== 0) doc.x += 15;

      doc.font(fontBold).text(`${item.no}. ${item.th}`, {
        align: 'left',
      });
      doc.moveDown(0.3);

      item.list.forEach((e, eIndex) => {
        const checkboxSymbol = setSymbol(
          data.data[index].detail.includes(e.label),
        );

        doc.x += 10.5;

        doc.font(emoji).text(checkboxSymbol, doc.x, doc.y);

        doc.font(fontNormal).text(e.labelTH, doc.x + 15, doc.y - 15.3, {
          align: 'left',
          lineGap: index === 3 && eIndex === 1 ? 6 : 0,
          continued: false,
        });

        doc.x -= 10.5;

        doc.x -= 15;

        doc.moveDown(0.3);
      });

      if (data.data[index].detail.includes('อื่นๆ (Other)')) {
        doc.font(fontNormal).text(data.data[index].other, doc.x + 15, doc.y, {
          align: 'left',
          continued: false,
        });
        doc.x -= 15;
      }
      doc.moveDown(0.3);

      doc.x -= 15;
    });

    // Additional Topic

    doc.moveDown(0.3);
    if (data.data.length > 5) {
      data.data.slice(5).map((item, index) => {
        doc
          .font(fontBold)
          .text(`${6 + index}. ${item.topic}`, doc.x + 15, doc.y, {
            align: 'left',
            continued: false,
          });
        doc.x -= 15;
        doc.moveDown(0.4);
        doc.font(fontNormal).text(item.detail[0], doc.x + 26.5, doc.y, {
          align: 'left',
          continued: false,
        });
        doc.x -= 26.5;
        doc.moveDown(0.5);
      });
    }
  }
};
