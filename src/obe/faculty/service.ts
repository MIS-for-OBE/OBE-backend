import { BadRequestException, Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Faculty } from './schemas/schema';
import { Model } from 'mongoose';

@Injectable()
export class FacultyService {
  constructor(
    @InjectModel(Faculty.name) private readonly model: Model<Faculty>,
  ) {}

  async getFaculty(facultyCode: string): Promise<Faculty> {
    try {
      const res = await this.model.findOne({ facultyCode: facultyCode });
      if (!res) {
        throw new BadRequestException('Faculty not found');
      }
      return res;
    } catch (error) {
      throw new BadRequestException(error);
    }
  }
}
