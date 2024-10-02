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

@Injectable()
export class TQF3Service {
  constructor(
    @InjectModel(TQF3.name) private readonly model: Model<TQF3>,
    private readonly generatePdfBLL: GeneratePdfBLL,
  ) {}

  private populatePart4(tqf3: TQF3) {
    try {
      const part4 = tqf3.part4.data.map((item) => {
        const evals = [];
        item.evals.forEach((evalItem) => {
          evals.push(
            tqf3.part3.eval.find(
              (e: any) => e._id.toString() === evalItem.eval.toString(),
            ),
          );
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
        requestDTO.clo.forEach((newCloItem) => {
          const existingCloItem = tqf3Document.part2.clo.find(
            (clo: any) => clo.id == newCloItem.id,
          );

          if (existingCloItem) {
            existingCloItem.descTH = newCloItem.descTH;
            existingCloItem.descEN = newCloItem.descEN;
            existingCloItem.learningMethod = newCloItem.learningMethod;
            existingCloItem.other = newCloItem.other;
          } else {
            tqf3Document.part2.clo.push(newCloItem);
          }
        });

        tqf3Document.part2.clo = tqf3Document.part2.clo.filter(
          (existingCloItem: any) =>
            requestDTO.clo.some(
              (newCloItem) => newCloItem.id === existingCloItem.id,
            ),
        );
        if (tqf3Document.part4) {
          tqf3Document.part4.data = tqf3Document.part4.data.filter(
            (existingCloItem) =>
              requestDTO.clo.some(
                (newCloItem) => newCloItem.id === existingCloItem.clo,
              ),
          );
        }

        tqf3Document.part2.teachingMethod = requestDTO.teachingMethod;
        tqf3Document.part2.evaluate = requestDTO.evaluate;
        tqf3Document.part2.schedule = requestDTO.schedule;
      } else if (params.part === 'part3') {
        requestDTO.eval.forEach((newEvalItem) => {
          const existingEvalItem = tqf3Document.part3.eval.find(
            (item: any) => item.id == newEvalItem.id,
          );

          if (existingEvalItem) {
            existingEvalItem.topicTH = newEvalItem.topicTH;
            existingEvalItem.topicEN = newEvalItem.topicEN;
            existingEvalItem.desc = newEvalItem.desc;
            existingEvalItem.percent = newEvalItem.percent;
          } else {
            tqf3Document.part3.eval.push(newEvalItem);
            // delete tqf3Document.part4;
          }
        });

        tqf3Document.part3.eval = tqf3Document.part3.eval.filter(
          (existingEvalItem: any) =>
            requestDTO.eval.some(
              (newEvalItem) => newEvalItem.id === existingEvalItem.id,
            ),
        );
        if (tqf3Document.part4) {
          tqf3Document.part4.data = tqf3Document.part4.data.filter(
            (existingCloItem) =>
              requestDTO.clo.some(
                (newCloItem) => newCloItem.id === existingCloItem.clo,
              ),
          );
        }

        tqf3Document.part3.gradingPolicy = requestDTO.gradingPolicy;
      } else {
        tqf3Document[params.part] = requestDTO;
      }

      tqf3Document.status =
        params.part === 'part7' ? TQF_STATUS.DONE : TQF_STATUS.IN_PROGRESS;

      await tqf3Document.save({ validateModifiedOnly: true });

      return tqf3Document;
    } catch (error) {
      throw error;
    }
  }

  async generatePDF(requestDTO: GeneratePdfDTO): Promise<any> {
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
      if (requestDTO.part7 !== undefined) {
        const filename = await this.generatePdfBLL.generatePdf(7, date, {
          ...data,
          ...tqf3.part7?._doc,
        });
        files.push(filename);
      }

      return files;
    } catch (error) {
      throw error;
    }
  }
}
