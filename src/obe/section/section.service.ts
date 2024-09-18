import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { Section } from './schemas/section.schema';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { CourseManagement } from '../courseManagement/schemas/courseManagement.schema';
import { Course } from '../course/schemas/course.schema';

@Injectable()
export class SectionService {
  constructor(
    @InjectModel(Section.name) private readonly model: Model<Section>,
    @InjectModel(CourseManagement.name)
    private readonly courseManagementModel: Model<CourseManagement>,
    @InjectModel(Course.name) private readonly courseModel: Model<Course>,
  ) {}

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
          `Section No ${('000' + requestDTO.data.sectionNo).slice(-3)} already exists`,
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
        throw new NotFoundException('Course not found');
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

  async updateSectionActive(id: string, requestDTO: any): Promise<Section> {
    try {
      const updateSection = await this.model.findByIdAndUpdate(id, requestDTO, {
        new: true,
      });
      return updateSection;
    } catch (error) {
      throw error;
    }
  }

  async deleteSection(id: string, requestDTO: any): Promise<Section> {
    try {
      const updateCourse = await this.courseManagementModel.findOneAndUpdate(
        { courseNo: requestDTO.courseNo },
        { $pull: { sections: { sectionNo: requestDTO.sectionNo } } },
        { new: true },
      );
      if (!updateCourse) {
        throw new NotFoundException('Course not found');
      }
      await this.courseModel.findByIdAndUpdate(requestDTO.courseId, {
        $pull: { sections: id },
      });
      const deleteSection = await this.model.findByIdAndDelete(id);
      if (!deleteSection) {
        throw new NotFoundException('Section not found');
      }
      return deleteSection;
    } catch (error) {
      throw error;
    }
  }
}
