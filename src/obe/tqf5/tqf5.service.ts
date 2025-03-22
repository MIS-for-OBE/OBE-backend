import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { TQF5 } from './schemas/tqf5.schema';
import { Model } from 'mongoose';
import { METHOD_TQF5, TQF_STATUS } from 'src/common/enum/type.enum';
import { GeneratePdfDTO } from './dto/dto';
import * as moment from 'moment';
import * as fs from 'fs';
import { join } from 'path';
import { TQF3 } from '../tqf3/schemas/tqf3.schema';
import { GeneratePdfTqf5BLL } from './bll/genPdf';
import { TQF3Service } from '../tqf3/tqf3.service';

@Injectable()
export class TQF5Service {
  constructor(
    @InjectModel(TQF5.name) private readonly model: Model<TQF5>,
    @InjectModel(TQF3.name) private readonly tqf3Model: Model<TQF3>,
    private readonly tqf3Service: TQF3Service,
    private readonly generatePdfBLL: GeneratePdfTqf5BLL,
  ) {}

  async changeMethod(
    params: { id: string },
    requestDTO: { method: METHOD_TQF5 },
  ): Promise<TQF5> {
    try {
      const tqf5Document = await this.model.findByIdAndUpdate(
        params.id,
        {
          $unset: { assignmentsMap: 1, part2: 1, part3: 1 },
          method: requestDTO.method,
          status: TQF_STATUS.IN_PROGRESS,
        },
        { new: true },
      );
      if (!tqf5Document) {
        throw new NotFoundException('TQF5 not found');
      }
      return tqf5Document;
    } catch (error) {
      throw error;
    }
  }

  async mappingAssignments(
    params: { id: string },
    requestDTO: any,
  ): Promise<any> {
    try {
      const tqf5Document = await this.model.findByIdAndUpdate(
        params.id,
        {
          $unset: { part2: 1, part3: 1 },
          assignmentsMap: requestDTO.assignments,
        },
        { new: true },
      );
      if (!tqf5Document) {
        throw new NotFoundException('TQF5 not found');
      }
      return tqf5Document.assignmentsMap;
    } catch (error) {
      throw error;
    }
  }

  async saveEachPart(
    params: { id: string; part: string },
    requestDTO: any,
  ): Promise<TQF5> {
    try {
      const tqf5Document = await this.model.findById(params.id);
      if (!tqf5Document) {
        throw new NotFoundException('TQF5 not found');
      }

      tqf5Document[params.part] = { ...requestDTO };

      if (params.part === 'part2' && tqf5Document.part3) {
        await this.model.updateOne(
          { _id: params.id },
          { $unset: { part3: 1 } },
        );
      }

      tqf5Document.status =
        (tqf5Document.part3 || params.part === 'part3') &&
        !requestDTO.inProgress
          ? TQF_STATUS.DONE
          : TQF_STATUS.IN_PROGRESS;

      await tqf5Document.save({ validateModifiedOnly: true });

      return await this.model.findById(params.id);
    } catch (error) {
      throw error;
    }
  }

  async generatePDF(
    facultyCode: string,
    requestDTO: GeneratePdfDTO,
  ): Promise<any> {
    try {
      const tqf3: any = await this.tqf3Model.findById(requestDTO.tqf3);
      const tqf5: any = await this.model.findById(requestDTO.tqf5);

      const date = moment().format('DD-MM-YYYY');
      let files = [];

      if (requestDTO.part1 !== undefined) {
        const filename = await this.generatePdfBLL.generatePdf(
          1,
          date,
          {},
          {
            ...tqf5.part1.list.find(({ curriculum }) =>
              requestDTO.curriculum == '-'
                ? !curriculum
                : curriculum == requestDTO.curriculum,
            )._doc,
          },
          { ...this.tqf3Service.populateTqf3Part4(tqf3) },
        );
        files.push(filename);
      }

      if (requestDTO.oneFile) {
        const fileAllParts = await this.generatePdfBLL.mergePdfs(
          files,
          `TQF5_${requestDTO.courseNo}_${requestDTO.academicTerm}${requestDTO.academicYear}_All_Parts_${date}.pdf`,
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

  private populatePart2(tqf5: TQF5, tqf3: TQF3) {
    try {
      const part2 = tqf5.part2.data.map((item) => {
        const assignments = [];
        item.assignments.forEach((evalItem) => {
          assignments.push({
            eval: tqf3.part3.eval.find(
              (e: any) => e._id.toString() === evalItem.eval.toString(),
            ),
            questions: evalItem.questions,
          });
        });
        return {
          clo: tqf3.part2.clo.find(
            (clo: any) => clo._id.toString() === item.clo.toString(),
          ),
          assignments,
        };
      });
      return { data: part2 };
    } catch (error) {
      throw error;
    }
  }

  private populatePart3(tqf5: TQF5, tqf3: TQF3) {
    try {
      const part3 = tqf5.part3.data.map((item) => {
        const assess = [];
        item.assess.forEach((evalItem) => {
          assess.push({
            ...evalItem,
            eval: tqf3.part3.eval.find(
              (e: any) => e._id.toString() === evalItem.eval.toString(),
            ),
          });
        });
        return {
          clo: tqf3.part2.clo.find(
            (clo: any) => clo._id.toString() === item.clo.toString(),
          ),
          assess,
        };
      });
      return { data: part3 };
    } catch (error) {
      throw error;
    }
  }
}
