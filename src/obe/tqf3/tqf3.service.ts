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
import { PLOService } from '../plo/plo.service';
import { Course } from '../course/schemas/course.schema';

@Injectable()
export class TQF3Service {
  constructor(
    @InjectModel(TQF3.name) private readonly model: Model<TQF3>,
    @InjectModel(Course.name) private readonly courseModel: Model<Course>,
    private readonly ploService: PLOService,
    private readonly generatePdfBLL: GeneratePdfBLL,
  ) {}

  async getCourseReuseTQF3(requestDTO: any): Promise<any[]> {
    try {
      const courseList = await this.courseModel.find({});
      return courseList;
    } catch (error) {
      throw error;
    }
  }

  async reuseTQF3(requestDTO: any): Promise<TQF3> {
    try {
      // const courseList = await this.courseModel.find();
      return;
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
            tqf3Document.part2.clo.push(newCloItem);
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
        if (tqf3Document.part7?.data.length) {
          tqf3Document.part7.data = tqf3Document.part7.data.filter((item) =>
            validCloIds.includes(item.clo.toString()),
          );
          tqf3Document.part7.data.sort((a: any, b: any) => {
            const aIndex = cloIndexMap[a.clo.toString()];
            const bIndex = cloIndexMap[b.clo.toString()];
            return (
              (aIndex !== undefined ? aIndex : Infinity) -
              (bIndex !== undefined ? bIndex : Infinity)
            );
          });
        }
      } else if (params.part === 'part3') {
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
            tqf3Document.part3.eval.push(newEvalItem);
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
      }

      tqf3Document.status =
        params.part === 'part7' ? TQF_STATUS.DONE : TQF_STATUS.IN_PROGRESS;

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
      const tqf3: any = await this.model.findById(requestDTO.tqf3);

      const date = moment().format('DD-MM-YYYY');
      const files = [];

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
          ...this.populatePart4(tqf3),
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

      if (files.length > 0) {
        const fileAllParts = await this.generatePdfBLL.mergePdfs(
          files,
          `TQF3_All_Parts_${date}.pdf`,
        );
        files.push(fileAllParts);
      }

      return files;
    } catch (error) {
      throw error;
    }
  }

  private populatePart4(tqf3: TQF3) {
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

  private populatePart7(tqf3: TQF3) {
    try {
      const part7 = tqf3.part7.data.map((item) => {
        return {
          clo: tqf3.part2.clo.find(
            (clo: any) => clo._id.toString() === item.clo.toString(),
          ),
          plos: item.plos,
        };
      });
      return { data: part7 };
    } catch (error) {
      throw error;
    }
  }
}
