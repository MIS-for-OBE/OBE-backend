import { Injectable } from '@nestjs/common';
import { Section } from './schemas/section.schema';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { User } from '../user/schemas/user.schema';

@Injectable()
export class SectionService {
  constructor(
    @InjectModel(Section.name) private readonly model: Model<Section>,
  ) {}
}
