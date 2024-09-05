import { BadRequestException, Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { TQF3 } from './schemas/schema';
import { Model } from 'mongoose';

@Injectable()
export class TQF3Service {
  constructor(@InjectModel(TQF3.name) private readonly model: Model<TQF3>) {}
}
