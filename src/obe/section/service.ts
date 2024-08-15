import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { Section } from './schemas/schema';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Course } from '../course/schemas/schema';
import { CourseManagement } from '../courseManagement/schemas/schema';

@Injectable()
export class SectionService {
  constructor(
    @InjectModel(Section.name) private readonly model: Model<Section>,
    // @InjectModel(Course.name) private readonly courseModel: Model<Course>,
    @InjectModel(CourseManagement.name)
    private readonly courseManagementModel: Model<CourseManagement>,
  ) {}

  async createSection(id: string, requestDTO: any): Promise<Section> {
    try {
      const createSection = await this.model.create(requestDTO);
      return createSection;
    } catch (error) {
      throw error;
    }
  }

  async updateSection(id: string, requestDTO: any): Promise<Section> {
    try {
      const check = await this.courseManagementModel.findOne({
        courseNo: requestDTO.courseNo,
      });
      const sectionExists = check.sections.find(
        (sec) =>
          sec.sectionNo == requestDTO.data.sectionNo &&
          sec.sectionNo !== requestDTO.oldSectionNo,
      );
      if (sectionExists) {
        throw new BadRequestException(
          `Section no ${('000' + requestDTO.data.sectionNo).slice(-3)} already exists`,
        );
      }
      const updateFields = {};
      for (const key in requestDTO.data) {
        updateFields[`sections.$[sec].${key}`] = requestDTO.data[key];
      }
      const updateCourse = await this.courseManagementModel.findOneAndUpdate(
        {
          courseNo: requestDTO.courseNo,
          'sections.sectionNo': requestDTO.oldSectionNo,
        },
        { $set: updateFields },
        {
          arrayFilters: [{ 'sec.sectionNo': requestDTO.oldSectionNo }],
          new: true,
        },
      );
      if (!updateCourse) {
        throw new NotFoundException('Section not found');
      }
      const updateSection = await this.model.findByIdAndUpdate(
        id,
        requestDTO.data,
        { new: true },
      );

      return updateSection;
    } catch (error) {
      throw error;
    }
  }

  async deleteSection(id: string, requestDTO: any): Promise<Section> {
    try {
      const deleteSection = await this.model.findByIdAndDelete(id);
      if (!deleteSection) {
        throw new NotFoundException('Section not found');
      }
      // const updateCourse = await this.courseModel.findByIdAndUpdate(
      //   requestDTO.courseId,
      //   { sections: { $pull: id } },
      // );
      // if (updateCourse.addFirstTime) {
      //   await this.courseManagementModel.findOneAndUpdate(
      //     { courseNo: updateCourse.courseNo },
      //     { sections: { $pull: deleteSection.sectionNo } },
      //   );
      // }
      return deleteSection;
    } catch (error) {
      throw error;
    }
  }
}
