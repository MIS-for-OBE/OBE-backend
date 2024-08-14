import { Injectable } from '@nestjs/common';
import { PLO } from './schemas/schema';
import { Model } from 'mongoose';
import { InjectModel } from '@nestjs/mongoose';
import { ROLE } from 'src/common/enum/role.enum';

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
      const where: any = { facultyCode };
      if (searchDTO.role !== ROLE.SUPREME_ADMIN) {
        where.departmentCode = { $in: searchDTO.departmentCode };
      }
      const totalCount = await this.model.countDocuments(where);
      const plos = await this.model.find(where).sort([
        ['year', 'desc'],
        ['semester', 'desc'],
      ]);
      return { totalCount, plos };
    } catch (error) {
      throw error;
    }
  }
}
