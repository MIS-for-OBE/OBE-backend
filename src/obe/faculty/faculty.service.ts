import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Curriculum, Faculty } from './schemas/faculty.schema';
import { Model } from 'mongoose';
import { PLO } from '../plo/schemas/plo.schema';
import { Course } from '../course/schemas/course.schema';
import { CourseManagement } from '../courseManagement/schemas/courseManagement.schema';
import { TEXT_ENUM } from 'src/common/enum/text.enum';

@Injectable()
export class FacultyService {
  constructor(
    @InjectModel(Faculty.name) private readonly model: Model<Faculty>,
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

      const [
        ploCurriculumCodes,
        courseManagementCurriculums,
        courseCurriculums,
      ] = await Promise.all([
        this.getPloCurriculumCodes(facultyCode),
        this.getCourseManagementCurriculums(),
        this.getCourseCurriculums(),
      ]);
      const allCurriculumCodes = [
        ...new Set([
          ...ploCurriculumCodes,
          ...courseManagementCurriculums,
          ...courseCurriculums,
        ]),
      ];

      res.curriculum.forEach((cur) => {
        cur.disable = allCurriculumCodes.includes(cur.code);
      });

      return res;
    } catch (error) {
      throw error;
    }
  }

  private async getPloCurriculumCodes(facultyCode: string): Promise<string[]> {
    const plos = await this.ploModel.find({ facultyCode }).select('curriculum');
    return plos.flatMap((plo) => plo.curriculum);
  }

  private async getCourseManagementCurriculums(): Promise<string[]> {
    const courseManagements = await this.courseManagementModel
      .find({ 'sections.curriculum': { $exists: true } })
      .select('sections.curriculum');
    return courseManagements.flatMap((course) =>
      course.sections.map((section) => section.curriculum),
    );
  }

  private async getCourseCurriculums(): Promise<string[]> {
    const courses = await this.courseModel
      .find({ 'sections.curriculum': { $exists: true } })
      .select('sections.curriculum');
    return courses.flatMap((course) =>
      course.sections.map((section) => section.curriculum),
    );
  }

  async createCurriculum(id: string, requestDTO: Curriculum): Promise<any> {
    try {
      const res = await this.model.findByIdAndUpdate(
        id,
        { $push: { curriculum: requestDTO } },
        { new: true },
      );
      if (!res) {
        throw new NotFoundException('Faculty not found');
      }
      return TEXT_ENUM.Success;
    } catch (error) {
      throw error;
    }
  }

  async updateCurriculum(
    params: { id: string; code: string },
    requestDTO: Curriculum,
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
      return TEXT_ENUM.Success;
    } catch (error) {
      throw error;
    }
  }
}
