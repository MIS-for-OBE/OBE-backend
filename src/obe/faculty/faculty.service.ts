import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Faculty } from './schemas/faculty.schema';
import { Model } from 'mongoose';
import { PLO } from '../plo/schemas/plo.schema';
import { Course } from '../course/schemas/course.schema';
import { CourseManagement } from '../courseManagement/schemas/courseManagement.schema';
import { TEXT_ENUM } from 'src/common/enum/text.enum';
import { User } from '../user/schemas/user.schema';
import { ROLE } from 'src/common/enum/role.enum';

@Injectable()
export class FacultyService {
  constructor(
    @InjectModel(Faculty.name) private readonly model: Model<Faculty>,
    @InjectModel(User.name) private readonly userModel: Model<User>,
    @InjectModel(PLO.name) private readonly ploModel: Model<PLO>,
    @InjectModel(Course.name) private readonly courseModel: Model<Course>,
    @InjectModel(CourseManagement.name)
    private readonly courseManagementModel: Model<CourseManagement>,
  ) {}

  async getFaculty(facultyCode: string): Promise<any> {
    try {
      const res: any = await this.model.findOne({ facultyCode: facultyCode });
      if (!res) {
        throw new NotFoundException('Faculty not found');
      }

      const [course, courseManagement] = await Promise.all([
        this.courseModel
          .find({
            ['sections.curriculum']: {
              $in: res.curriculum.map(({ code }) => code),
            },
          })
          .select('sections.curriculum'),
        this.courseManagementModel
          .find({
            ['sections.curriculum']: {
              $in: res.curriculum.map(({ code }) => code),
            },
          })
          .select('sections.curriculum'),
      ]);
      const allCurriculumCodes = new Set([
        ...course.flatMap(({ sections }) =>
          sections.flatMap((section) => section.curriculum).filter(Boolean),
        ),
        ...courseManagement.flatMap(({ sections }) =>
          sections.flatMap((section) => section.curriculum).filter(Boolean),
        ),
      ]);

      res.curriculum.forEach((cur) => {
        cur.disable = allCurriculumCodes.has(cur.code);
      });

      return res;
    } catch (error) {
      throw error;
    }
  }

  async createCurriculum(
    authUser: any,
    id: string,
    requestDTO: any,
  ): Promise<any> {
    try {
      const res = await this.model.findByIdAndUpdate(
        id,
        { $push: { curriculum: requestDTO } },
        { new: true },
      );
      if (!res) {
        throw new NotFoundException('Faculty not found');
      }
      if (authUser.role == ROLE.CURRICULUM_ADMIN) {
        await this.userModel.findByIdAndUpdate(authUser.id, {
          $push: { curriculums: requestDTO.code },
        });
      }
      await this.ploModel.updateOne(
        { _id: requestDTO.plo },
        { $push: { curriculum: requestDTO.code } },
      );
      return TEXT_ENUM.Success;
    } catch (error) {
      throw error;
    }
  }

  async updateCurriculum(
    params: { id: string; code: string },
    requestDTO: any,
  ): Promise<any> {
    try {
      const res = await this.model.findOneAndUpdate(
        { _id: params.id, 'curriculum.code': params.code },
        { $set: { 'curriculum.$': requestDTO } },
        { new: true },
      );
      if (!res) {
        throw new NotFoundException('Faculty not found');
      }
      await Promise.all([
        this.userModel.updateMany(
          { curriculum: params.code },
          {
            $pull: { curriculum: params.code },
            $push: { curriculums: requestDTO.code },
          },
        ),
        this.ploModel.findOneAndUpdate(
          { curriculum: params.code },
          { $pull: { curriculum: params.code } },
        ),
      ]);
      await this.ploModel.updateOne(
        { _id: requestDTO.plo },
        { $push: { curriculum: requestDTO.code } },
      );
      return TEXT_ENUM.Success;
    } catch (error) {
      throw error;
    }
  }

  async deleteCurriculum(id: string, code: string): Promise<any> {
    try {
      const res = await this.model.findByIdAndUpdate(
        id,
        { $pull: { curriculum: { code: code } } },
        { new: true },
      );
      if (!res) {
        throw new NotFoundException('Faculty not found');
      }
      await Promise.all([
        this.userModel.findOneAndUpdate(
          { curriculum: code },
          { $pull: { curriculum: code } },
        ),
        this.ploModel.findOneAndUpdate(
          { curriculum: code },
          { $pull: { curriculum: code } },
        ),
      ]);
      return TEXT_ENUM.Success;
    } catch (error) {
      throw error;
    }
  }
}
