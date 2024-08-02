import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Faculty } from './schemas/faculty.schema';
import { Model } from 'mongoose';

@Injectable()
export class FacultyService {
  constructor(
    @InjectModel(Faculty.name) private readonly model: Model<Faculty>,
  ) {}

  async getFaculty(facultyCode: string): Promise<Faculty> {
    return await this.model.findOne({ facultyCode });
  }
}
