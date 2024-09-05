import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { TQF3 } from './schemas/schema';
import { Model } from 'mongoose';
import { TQF_STATUS } from 'src/common/enum/type.enum';

@Injectable()
export class TQF3Service {
  constructor(@InjectModel(TQF3.name) private readonly model: Model<TQF3>) {}

  async savePart1(id: string, requestDTO: any): Promise<TQF3> {
    try {
      const updateTQF3 = await this.model.findByIdAndUpdate(
        id,
        { status: TQF_STATUS.IN_PROGRESS, part1: requestDTO },
        { new: true, fields: 'part1 updatedAt' },
      );
      if (!updateTQF3) {
        throw new NotFoundException('TQF3 not found.');
      }
      return updateTQF3;
    } catch (error) {
      throw error;
    }
  }
}
