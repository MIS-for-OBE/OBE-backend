import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { AcademicYear } from './schemas/academicYear.schema';
import { AcademicYearSearchDTO } from './dto/search.dto';
import { UserDTO } from 'src/obe/user/dto/dto';
import { CMU_OAUTH_ROLE, ROLE } from 'src/common/enum/role.enum';
import { User } from '../user/schemas/user.schema';

@Injectable()
export class AcademicYearService {
  constructor(
    @InjectModel(AcademicYear.name) private readonly model: Model<AcademicYear>,
  ) {}

  async searchAcademicYear(
    searchDTO: AcademicYearSearchDTO,
  ): Promise<AcademicYear[]> {
    return await this.model
      .find()
      .populate('creator')
      .populate('modifier')
      .skip((searchDTO.page - 1) * searchDTO.limit)
      .limit(searchDTO.limit);
  }

  async createAcademicYear(
    id: string,
    requestDTO: AcademicYear,
  ): Promise<AcademicYear> {
    return await this.model.create({
      year: requestDTO.year,
      semester: requestDTO.semester,
      creator: id,
      modifier: id,
    });
  }

  async deleteAcademicYear(id: string): Promise<AcademicYear> {
    return await this.model.findByIdAndDelete(id);
  }
}
