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
      const tqf5Document = await this.model.findById(params.id);
      if (!tqf5Document) {
        throw new NotFoundException('TQF5 not found.');
      }

      tqf5Document[params.part] = { ...requestDTO };

      tqf5Document.status =
        (tqf5Document.part3 || params.part === 'part3') &&
        !requestDTO.inProgress
          ? TQF_STATUS.DONE
          : TQF_STATUS.IN_PROGRESS;

      await tqf5Document.save({ validateModifiedOnly: true });

      return tqf5Document;
    } catch (error) {
      throw error;
    }
  }
}
