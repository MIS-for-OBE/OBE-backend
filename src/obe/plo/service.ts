import { Injectable } from '@nestjs/common';
import { PLO } from './schemas/schema';
import { Model } from 'mongoose';
import { InjectModel } from '@nestjs/mongoose';

@Injectable()
export class PLOService {
  constructor(
    @InjectModel(PLO.name) private readonly model: Model<PLO>,
    // @InjectModel(Course.name) private readonly courseModel: Model<Course>,
    // @InjectModel(CourseManagement.name)
    // private readonly courseManagementModel: Model<CourseManagement>,
  ) {}
  async searchPLO(facultyCode: string, searchDTO: any): Promise<any> {
    try {
      const plos = await this.model
        .find({
          facultyCode,
          departmentCode: { $in: searchDTO.departmentCode },
        })
        .sort([
          ['year', searchDTO.orderType],
          ['semester', searchDTO.orderType],
        ]);
      return plos;
    } catch (error) {
      throw error;
    }
  }
}
