import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { TQF5 } from './schemas/tqf5.schema';
import { Model } from 'mongoose';
import { TQF_STATUS } from 'src/common/enum/type.enum';

@Injectable()
export class TQF5Service {
  constructor(@InjectModel(TQF5.name) private readonly model: Model<TQF5>) {}

  async saveEachPart(
    params: { id: string; part: string },
    requestDTO: any,
  ): Promise<TQF5> {
    try {
      const updateTQF5 = await this.model.findByIdAndUpdate(
        params.id,
        {
          status:
            params.part == 'part3' ? TQF_STATUS.DONE : TQF_STATUS.IN_PROGRESS,
          [params.part]: requestDTO,
        },
        { new: true, fields: `status ${params.part} updatedAt` },
      );
      if (!updateTQF5) {
        throw new NotFoundException('TQF5 not found.');
      }
      return updateTQF5;
    } catch (error) {
      throw error;
    }
  }
}
