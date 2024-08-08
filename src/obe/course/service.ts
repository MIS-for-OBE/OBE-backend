import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Course } from './schemas/schema';
import { User } from '../user/schemas/schema';
import { Section } from '../section/schemas/schema';
import { CourseManagementService } from '../courseManagement/service';
import { CourseManagement } from '../courseManagement/schemas/schema';
import { COURSE_TYPE } from 'src/common/enum/type.enum';
import { CourseSearchDTO } from './dto/search.dto';
import { isNumeric } from 'validator';

@Injectable()
export class CourseService {
  constructor(
    @InjectModel(Course.name) private readonly model: Model<Course>,
    @InjectModel(Section.name) private readonly sectionModel: Model<Section>,
    @InjectModel(CourseManagement.name)
    private readonly courseManagementModel: Model<CourseManagement>,
    @InjectModel(User.name) private readonly userModel: Model<User>,
    private readonly courseManagementService: CourseManagementService,
  ) {}

  async searchCourse(id: string, searchDTO: CourseSearchDTO): Promise<any> {
    try {
      if (searchDTO.manage) {
        return await this.model
          .find({ academicYear: searchDTO.academicYear })
          .populate({
            path: 'sections',
            populate: [
              { path: 'instructor', select: 'firstNameEN lastNameEN email' },
            ],
          })
          .sort([[searchDTO.orderBy, searchDTO.orderType]])
          .skip((searchDTO.page - 1) * searchDTO.limit)
          .limit(searchDTO.limit);
      } else {
        const sections = await this.sectionModel.find({
          $or: [{ instructor: id }, { coInstructors: id }],
        });
        const where = {
          academicYear: searchDTO.academicYear,
          sections: { $in: sections.map((section) => section.id) },
        };
        if (searchDTO.search.length) {
          if (isNumeric(searchDTO.search)) {
            where['$expr'] = {
              $regexMatch: {
                input: { $toString: '$courseNo' },
                regex: searchDTO.search,
                options: 'i',
              },
            };
          } else {
            where['courseName'] = { $regex: searchDTO.search, $options: 'i' };
          }
        }
        const courses = await this.model
          .find(where)
          .populate({
            path: 'sections',
            populate: [
              { path: 'instructor', select: 'firstNameEN lastNameEN email' },
              { path: 'coInstructors', select: 'firstNameEN lastNameEN email' },
            ],
          })
          .sort([[searchDTO.orderBy, searchDTO.orderType]])
          .skip((searchDTO.page - 1) * searchDTO.limit)
          .limit(searchDTO.limit);
        const filterCourses = courses.map((course) => {
          course.sections = course.sections.filter(
            (section: any) =>
              section.instructor.id == id ||
              section.coInstructors.some((coIns) => coIns.id == id),
          );
          return course;
        });
        if (searchDTO.page == 1 && !searchDTO.search.length) {
          const totalCount = await this.model.countDocuments({
            academicYear: searchDTO.academicYear,
            sections: { $in: sections.map((section) => section.id) },
          });
          return { totalCount, courses: filterCourses };
        }
        return filterCourses;
      }
    } catch (error) {
      throw error;
    }
  }

  async searchOneCourse(id: string, searchDTO: any): Promise<Course> {
    try {
      const course = await this.model
        .findOne({
          academicYear: searchDTO.academicYear,
          courseNo: searchDTO.courseNo,
        })
        .populate({
          path: 'sections',
          populate: [
            { path: 'instructor', select: 'firstNameEN lastNameEN email' },
            { path: 'coInstructors', select: 'firstNameEN lastNameEN email' },
          ],
        });
      if (!course) {
        throw new NotFoundException('Course not found');
      }
      course.sections = course.sections.filter(
        (section: any) =>
          section.instructor.id == id ||
          section.coInstructors.some((coIns) => coIns.id == id),
      );
      return course;
    } catch (error) {
      throw error;
    }
  }

  async createCourse(id: string, requestDTO: any): Promise<any> {
    try {
      const existCourseManagement = await this.courseManagementModel.findOne({
        courseNo: requestDTO.courseNo,
      });
      if (existCourseManagement) {
        const existSection = [];
        requestDTO.sections.forEach((section: any) => {
          if (
            existCourseManagement.sections.find(
              (existSec: any) => existSec.sectionNo == section.sectionNo,
            )
          ) {
            existSection.push(section.sectionNo);
          }
        });
        if (existSection.length) {
          throw new BadRequestException(
            `Section ${existSection.join(', ')} has been already added.`,
          );
        } else {
          await existCourseManagement.updateOne({
            updatedYear: requestDTO.updatedYear,
            updatedSemester: requestDTO.updatedSemester,
            $push: { sections: requestDTO.sections },
          });
        }
      } else {
        await this.courseManagementService.createCourseManagement(
          id,
          requestDTO,
        );
      }
      requestDTO.sections.forEach((section: Section) => {
        if (requestDTO.type == COURSE_TYPE.SEL_TOPIC) {
          section.isProcessTQF3 = true;
        }
      });

      const newSecion = await this.sectionModel.insertMany(requestDTO.sections);

      const courseData: Course = {
        ...requestDTO,
        sections: newSecion.map((section) => section.id),
        addFirstTime: true,
      };
      if (requestDTO.type !== COURSE_TYPE.SEL_TOPIC) {
        courseData.isProcessTQF3 = true;
      }

      let course = await this.model.findOne({
        academicYear: requestDTO.academicYear,
        courseNo: requestDTO.courseNo,
      });
      if (course) {
        await course.updateOne(
          { $push: { sections: courseData.sections } },
          { new: true },
        );
        course = await this.model.findOne({
          academicYear: requestDTO.academicYear,
          courseNo: requestDTO.courseNo,
        });
      } else {
        course = await this.model.create(courseData);
      }
      await course.populate({
        path: 'sections',
        populate: [
          { path: 'instructor', select: 'firstNameEN lastNameEN email' },
          { path: 'coInstructors', select: 'firstNameEN lastNameEN email' },
        ],
      });
      course.sections = course.sections.filter(
        (section: any) =>
          section.instructor.id == id ||
          section.coInstructors.some((coIns: any) => coIns.id == id),
      );
      return course;
    } catch (error) {
      throw error;
    }
  }

  async updateCourse(id: string, requestDTO: any): Promise<Course> {
    try {
      const updateCourse: any = await this.model.findByIdAndUpdate(
        id,
        requestDTO,
      );
      if (!updateCourse) {
        throw new NotFoundException('Course not found');
      }
      await this.courseManagementModel.findOneAndUpdate(
        { courseNo: updateCourse.courseNo },
        requestDTO,
      );
      return { ...updateCourse._doc, ...requestDTO };
    } catch (error) {
      throw error;
    }
  }

  async deleteCourse(id: string): Promise<Course> {
    try {
      const deleteCourse = await this.model.findByIdAndDelete(id);
      if (!deleteCourse) {
        throw new NotFoundException('Course not found');
      }
      await this.sectionModel.deleteMany({
        _id: { $in: deleteCourse.sections },
      });
      await this.courseManagementModel.findOneAndDelete({
        courseNo: deleteCourse.courseNo,
      });
      return deleteCourse;
    } catch (error) {
      throw error;
    }
  }
}
