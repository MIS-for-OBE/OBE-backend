import { Injectable } from '@nestjs/common';
import { PLO } from './schemas/schema';
import { Collection, Model } from 'mongoose';
import { InjectModel } from '@nestjs/mongoose';
import { ROLE } from 'src/common/enum/role.enum';
import { Faculty } from '../faculty/schemas/schema';

@Injectable()
export class PLOService {
  constructor(
    @InjectModel(PLO.name) private readonly model: Model<PLO>,
    @InjectModel(Faculty.name) private readonly facultyModel: Model<Faculty>,
    // @InjectModel(Course.name) private readonly courseModel: Model<Course>,
    // @InjectModel(CourseManagement.name)
    // private readonly courseManagementModel: Model<CourseManagement>,
  ) {}
  async searchPLO(facultyCode: string, searchDTO: any): Promise<any> {
    try {
      const isSAdmin = searchDTO.role == ROLE.SUPREME_ADMIN;
      const where: any = { facultyCode };
      if (!isSAdmin) {
        where.departmentCode = { $in: searchDTO.departmentCode };
      }
      const faculty = await this.facultyModel.findOne({ facultyCode });
      const totalCount = await this.model.countDocuments(where);
      const data = await this.model.find(where).sort([
        ['year', 'desc'],
        ['semester', 'desc'],
      ]);
      const departmentCodes = isSAdmin
        ? faculty.department.map((dep) => dep.departmentCode)
        : searchDTO.departmentCode;
      const plos = departmentCodes.map((dep) => {
        return {
          departmentCode: dep,
          departmentEN: faculty.department.find(
            (code) => code.departmentCode == dep,
          ).departmentEN,
          collections: [],
        };
      });
      plos.forEach((plo, index) => {
        data.forEach((collection) => {
          if (collection.departmentCode.includes(plo.departmentCode)) {
            plo.collections.push(collection);
          }
        });
      });
      const filteredPLOs = plos.filter((plo) => plo.collections.length > 0);
      return { totalCount, plos: filteredPLOs };
    } catch (error) {
      throw error;
    }
  }
}
