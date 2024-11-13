import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Faculty } from './schemas/faculty.schema';
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

  async getCourseCode(
    facultyCode: string,
    departmentCode: string[],
  ): Promise<{ [key: string]: number }> {
    try {
      const res = await this.model.findOne({ facultyCode: facultyCode });
      if (!res) {
        throw new NotFoundException('Faculty not found');
      }
      const courseCodeMap = res.department
        .filter((dep) => departmentCode.includes(dep.codeEN))
        .reduce(
          (acc, dep) => {
            if (dep.courseCode !== null && dep.courseCode !== undefined) {
              acc[dep.codeEN] = dep.courseCode;
            }
            return acc;
          },
          { [res.codeEN]: res.courseCode } as { [key: string]: number },
        );
      if (!facultyCode.includes(res.codeEN)) {
        delete courseCodeMap[res.codeEN];
      }
      return courseCodeMap;
    } catch (error) {
      throw error;
    }
  }
}
