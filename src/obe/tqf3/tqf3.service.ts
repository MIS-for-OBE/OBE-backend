import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { TQF3 } from './schemas/tqf3.schema';
import { Model } from 'mongoose';
import { TQF_STATUS } from 'src/common/enum/type.enum';
import { GeneratePdfDTO } from './dto/dto';
import * as moment from 'moment';
import axios from 'axios';
import {
  CmuApiTqfCourseDTO,
  CmuApiTqfCourseSearchDTO,
} from 'src/common/cmu-api/cmu-api.dto';
import { GeneratePdfBLL } from './bll/genPdf';
import { Course } from '../course/schemas/course.schema';
import { Faculty } from '../faculty/schemas/faculty.schema';
import * as fs from 'fs';
import { join } from 'path';
import { TQF5 } from '../tqf5/schemas/tqf5.schema';

@Injectable()
export class TQF3Service {
  constructor(
    @InjectModel(TQF3.name) private readonly model: Model<TQF3>,
    @InjectModel(TQF5.name) private readonly tqf5Model: Model<TQF5>,
    @InjectModel(Course.name) private readonly courseModel: Model<Course>,
    @InjectModel(Faculty.name) private readonly facultyModel: Model<Faculty>,
    private readonly generatePdfBLL: GeneratePdfBLL,
  ) {}

  async getCourseReuseTQF3(searchDTO: any): Promise<any[]> {
    try {
      const year = parseInt(searchDTO.year);
      const semester = parseInt(searchDTO.semester);
      if (![1, 2, 3].includes(semester)) {
        throw new Error('Invalid semester provided');
      }
      const termsToInclude: { year: number; semester: number }[] = [];
      switch (semester) {
        case 1:
          termsToInclude.push(
            { year: year - 1, semester: 3 },
            { year: year - 1, semester: 2 },
            { year: year - 1, semester: 1 },
          );
          break;
        case 2:
          termsToInclude.push(
            { year: year, semester: 1 },
            { year: year - 1, semester: 3 },
            { year: year - 1, semester: 2 },
          );
          break;
        case 3:
          termsToInclude.push(
            { year: year, semester: 2 },
            { year: year, semester: 1 },
            { year: year - 1, semester: 3 },
          );
          break;
      }
      let courseList = await this.courseModel
        .find({ $or: termsToInclude })
        .select([
          'year',
          'semester',
          'courseNo',
          'courseName',
          'type',
          'TQF3',
          'sections',
        ])
        .sort({ year: 'desc', semester: 'desc' })
        .populate({
          path: 'sections',
          select: 'topic TQF3',
          populate: [{ path: 'TQF3', select: 'status' }],
        })
        .populate('TQF3', 'status');
      courseList = courseList.filter(({ TQF3, sections }) => {
        sections = sections.filter(
          (sec) => sec.TQF3?.status == TQF_STATUS.DONE,
        );
        return (
          TQF3?.status == TQF_STATUS.DONE ||
          sections.find((sec) => sec.TQF3?.status == TQF_STATUS.DONE)
        );
      });
      const uniqueCoursesMap = new Map<String, any>();
      for (const course of courseList) {
        if (!uniqueCoursesMap.has(course.courseNo)) {
          uniqueCoursesMap.set(course.courseNo, course);
        }
      }
      const uniqueCourseList = Array.from(uniqueCoursesMap.values());
      return uniqueCourseList;
    } catch (error) {
      throw error;
    }
  }

  async reuseTQF3(requestDTO: any): Promise<TQF3> {
    try {
      const [newTqf3] = await Promise.all([
        await this.model.findById(requestDTO.reuseId),
        this.model.findByIdAndUpdate(requestDTO.id, {
          $unset: {
            part1: 1,
            part2: 1,
            part3: 1,
            part4: 1,
            part5: 1,
            part6: 1,
            part7: 1,
          },
        }),
      ]);
      delete newTqf3.id;
      return newTqf3;
    } catch (error) {
      throw error;
    }
  }

  async saveEachPart(
    params: { id: string; part: string },
    requestDTO: any,
  ): Promise<TQF3> {
    try {
      const tqf3Document = await this.model.findById(params.id);
      if (!tqf3Document) {
        throw new NotFoundException('TQF3 not found.');
      }

      if (params.part === 'part2') {
        if (!tqf3Document.part2) tqf3Document.part2 = {} as any;
        tqf3Document.part2.teachingMethod = requestDTO.teachingMethod;
        tqf3Document.part2.evaluate = requestDTO.evaluate;
        tqf3Document.part2.schedule = requestDTO.schedule;
        requestDTO.clo.forEach((newCloItem) => {
          const existingCloItem = tqf3Document.part2.clo.find(
            (clo: any) => clo.id == newCloItem.id,
          );
          if (existingCloItem) {
            existingCloItem.no = newCloItem.no;
            existingCloItem.descTH = newCloItem.descTH;
            existingCloItem.descEN = newCloItem.descEN;
            existingCloItem.learningMethod = newCloItem.learningMethod;
            existingCloItem.other = newCloItem.other;
          } else {
            const newItem = { ...newCloItem };
            if (newCloItem.id) newItem._id = newCloItem.id;
            tqf3Document.part2.clo.push(newItem);
            newCloItem.id = (
              tqf3Document.part2.clo[tqf3Document.part2.clo.length - 1] as any
            ).id;
          }
        });
        tqf3Document.part2.clo = tqf3Document.part2.clo.filter(
          (existingCloItem: any) =>
            requestDTO.clo.some(
              (newCloItem) => newCloItem.id === existingCloItem.id,
            ),
        );
        tqf3Document.part2.clo.sort((a: any, b: any) => a.no - b.no);
        // Map the CLO ID to its index
        const cloIndexMap: Record<string, number> = {};
        tqf3Document.part2.clo.forEach((newCloItem: any, index: number) => {
          cloIndexMap[newCloItem.id] = index;
        });
        const validCloIds = tqf3Document.part2.clo.map(
          (newCloItem: any) => newCloItem.id,
        );
        if (tqf3Document.part4?.data.length) {
          tqf3Document.part4.data = tqf3Document.part4.data.filter(
            (item: any) => validCloIds.includes(item.clo.toString()),
          );
          tqf3Document.part4.data.sort((a: any, b: any) => {
            const aIndex = cloIndexMap[a.clo.toString()];
            const bIndex = cloIndexMap[b.clo.toString()];
            return (
              (aIndex !== undefined ? aIndex : Infinity) -
              (bIndex !== undefined ? bIndex : Infinity)
            );
          });
        }
        if (tqf3Document.part7?.list.length) {
          tqf3Document.part7.list = tqf3Document.part7.list.map((cur) => {
            cur.data = cur.data.filter((item) =>
              validCloIds.includes(item.clo?.toString()),
            );
            return cur;
          });
          tqf3Document.part7.list.forEach((item) =>
            item.data.sort((a: any, b: any) => {
              const aIndex = cloIndexMap[a.clo?.toString()];
              const bIndex = cloIndexMap[b.clo?.toString()];
              return (
                (aIndex !== undefined ? aIndex : Infinity) -
                (bIndex !== undefined ? bIndex : Infinity)
              );
            }),
          );
        }
      } else if (params.part === 'part3') {
        if (!tqf3Document.part3) tqf3Document.part3 = {} as any;
        tqf3Document.part3.gradingPolicy = requestDTO.gradingPolicy;
        requestDTO.eval.forEach((newEvalItem) => {
          const existingEvalItem = tqf3Document.part3.eval.find(
            (item: any) => item.id == newEvalItem.id,
          );
          if (existingEvalItem) {
            existingEvalItem.no = newEvalItem.no;
            existingEvalItem.topicTH = newEvalItem.topicTH;
            existingEvalItem.topicEN = newEvalItem.topicEN;
            existingEvalItem.desc = newEvalItem.desc;
            existingEvalItem.percent = newEvalItem.percent;
          } else {
            const newItem = { ...newEvalItem };
            if (newEvalItem.id) newItem._id = newEvalItem.id;
            tqf3Document.part3.eval.push(newItem);
            newEvalItem.id = (
              tqf3Document.part3.eval[tqf3Document.part3.eval.length - 1] as any
            ).id;
          }
        });
        tqf3Document.part3.eval = tqf3Document.part3.eval.filter(
          (existingEvalItem: any) =>
            requestDTO.eval.some((item) => item.id === existingEvalItem.id),
        );
        tqf3Document.part3.eval.sort((a: any, b: any) => a.no - b.no);
      } else {
        tqf3Document[params.part] = { ...requestDTO };
        if (params.part === 'part4' && requestDTO.tqf5) {
          await this.tqf5Model.findByIdAndUpdate(requestDTO.tqf5, {
            $unset: { assignmentsMap: 1, part2: 1, part3: 1 },
            status: TQF_STATUS.IN_PROGRESS,
          });
        }
      }

      tqf3Document.status =
        ((tqf3Document.part6 ||
          tqf3Document.part7 ||
          ['part6', 'part7'].includes(params.part)) &&
          !requestDTO.inProgress) ||
        requestDTO.done
          ? TQF_STATUS.DONE
          : TQF_STATUS.IN_PROGRESS;

      await tqf3Document.save({ validateModifiedOnly: true });

      return tqf3Document;
    } catch (error) {
      throw error;
    }
  }

  async generatePDF(
    facultyCode: string,
    requestDTO: GeneratePdfDTO,
  ): Promise<any> {
    try {
      const courseInfo = await axios.get(
        `${process.env.BASE_CMU_API}course-template`,
        {
          params: {
            courseid: requestDTO.courseNo,
            academicyear: requestDTO.academicYear,
            academicterm: requestDTO.academicTerm,
          } as CmuApiTqfCourseSearchDTO,
        },
      );
      let data: CmuApiTqfCourseDTO = courseInfo.data[0];
      data = { ...data, ...requestDTO };

      if (!data.CourseID) {
        const course = await this.courseModel.findOne({
          year: requestDTO.academicYear,
          semester: requestDTO.academicTerm,
          courseNo: requestDTO.courseNo,
        });
        data.AcademicYear = course.year.toString();
        data.AcademicTerm = course.semester;
        data.CourseID = course.courseNo;
        data.CourseTitleTha = course.courseName;
        data.CourseTitleEng = course.courseName;
        data.FacultyID = facultyCode;
      }
      if (!data.FacultyNameEng) {
        const faculty = await this.facultyModel.findOne({
          facultyCode: facultyCode,
        });
        data.FacultyNameEng = faculty?.facultyEN;
        data.FacultyNameTha = faculty?.facultyTH;
        const department = faculty.department.find(
          ({ code }) => code == data.CourseCodeEng,
        );
        data.DepartmentNameEng = department?.nameEN;
        data.DepartmentNameTha = department?.nameTH;
      }

      const tqf3: any = await this.model.findById(requestDTO.tqf3);

      const date = moment().format('DD-MM-YYYY');
      let files = [];

      if (requestDTO.part1 !== undefined) {
        const filename = await this.generatePdfBLL.generatePdf(1, date, {
          ...data,
          ...tqf3.part1._doc,
        });
        files.push(filename);
      }
      if (requestDTO.part2 !== undefined) {
        const filename = await this.generatePdfBLL.generatePdf(2, date, {
          ...data,
          ...tqf3.part2._doc,
        });
        files.push(filename);
      }
      if (requestDTO.part3 !== undefined) {
        const filename = await this.generatePdfBLL.generatePdf(3, date, {
          ...data,
          ...tqf3.part3._doc,
        });
        files.push(filename);
      }
      if (requestDTO.part4 !== undefined) {
        const filename = await this.generatePdfBLL.generatePdf(4, date, {
          ...data,
          ...this.populateTqf3Part4(tqf3),
        });
        files.push(filename);
      }
      if (requestDTO.part5 !== undefined) {
        const filename = await this.generatePdfBLL.generatePdf(5, date, {
          ...data,
          ...tqf3.part5._doc,
        });
        files.push(filename);
      }
      if (requestDTO.part6 !== undefined) {
        const filename = await this.generatePdfBLL.generatePdf(6, date, {
          ...data,
          ...tqf3.part6._doc,
        });
        files.push(filename);
      }

      if (requestDTO.oneFile) {
        const fileAllParts = await this.generatePdfBLL.mergePdfs(
          files,
          `TQF3_${requestDTO.courseNo}_${requestDTO.academicTerm}${requestDTO.academicYear}_All_Parts_${date}.pdf`,
        );
        files.forEach((file) => {
          const filePath = join(process.cwd(), file);
          if (fs.existsSync(filePath)) {
            fs.unlinkSync(filePath);
          }
        });
        files = [fileAllParts];
      }

      return files;
    } catch (error) {
      throw error;
    }
  }

  populateTqf3Part4(tqf3: TQF3) {
    try {
      const part4 = tqf3.part4.data.map((item) => {
        const evals = [];
        item.evals.forEach((evalItem) => {
          evals.push({
            eval: tqf3.part3.eval.find(
              (e: any) => e._id.toString() === evalItem.eval.toString(),
            ),
            evalWeek: evalItem.evalWeek,
            percent: evalItem.percent,
          });
        });
        return {
          clo: tqf3.part2.clo.find(
            (clo: any) => clo._id.toString() === item.clo.toString(),
          ),
          evals,
          percent: item.percent,
        };
      });
      return { data: part4 };
    } catch (error) {
      throw error;
    }
  }
}
