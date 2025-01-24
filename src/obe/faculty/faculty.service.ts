import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Curriculum, Faculty } from './schemas/faculty.schema';
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
        throw new NotFoundException('Faculty not found');
      }
      return res;
    } catch (error) {
      throw error;
    }
  }

  async createCurriculum(id: string, requestDTO: Curriculum): Promise<Faculty> {
    try {
      const res = await this.model.findByIdAndUpdate(
        id,
        { $push: { curriculum: requestDTO } },
        { new: true },
      );
      if (!res) {
        throw new NotFoundException('Faculty not found');
      }
      return res;
    } catch (error) {
      throw error;
    }
  }

  async updateCurriculum(
    params: { id: string; code: string },
    requestDTO: Curriculum,
  ): Promise<Faculty> {
    try {
      const res = await this.model.findOneAndUpdate(
        { _id: params.id, 'curriculum.code': params.code },
        { $set: { 'curriculum.$': requestDTO } },
        { new: true },
      );
      if (!res) {
        throw new NotFoundException('Faculty not found');
      }
      return res;
    } catch (error) {
      throw error;
    }
  }

  async deleteCurriculum(id: string, code: string): Promise<Faculty> {
    try {
      const res = await this.model.findByIdAndUpdate(
        id,
        { $pull: { curriculum: { code: code } } },
        { new: true },
      );
      if (!res) {
        throw new NotFoundException('Faculty not found');
      }
      return res;
    } catch (error) {
      throw error;
    }
  }
}
