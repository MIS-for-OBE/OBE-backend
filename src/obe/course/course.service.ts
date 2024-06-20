import { BadRequestException, Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Course } from './schemas/course.schema';
import { User } from '../user/schemas/user.schema';
import { Section } from '../section/schemas/section.schema';
import { CourseManagementService } from '../courseManagement/courseManagement.service';
import {
  CourseManagement,
  SectionManagement,
} from '../courseManagement/schemas/courseManagement.schema';
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
    if (searchDTO.manage) {
      return await this.model
        .find({ academicYear: searchDTO.academicYear })
        .sort([[searchDTO.orderBy, searchDTO.orderType]])
        .skip((searchDTO.page - 1) * searchDTO.limit)
        .limit(searchDTO.limit);
    } else {
      const sections = await this.sectionModel.find({
        $or: [{ instructor: id }, { coInstructors: id }],
      });
      const where = {
        academicYear: searchDTO.academicYear,
        sections: { $in: sections.map((e) => e.id) },
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
          sections: { $in: sections.map((e) => e.id) },
        });
        return { totalCount, courses: filterCourses };
      }
      return filterCourses;
    }
  }

  async searchOneCourse(id: string, searchDTO: any): Promise<Course> {
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
    course.sections = course.sections.filter(
      (section: any) =>
        section.instructor.id == id ||
        section.coInstructors.some((coIns) => coIns.id == id),
    );
    return course;
  }

  async createCourse(id: string, requestDTO: any): Promise<Course> {
    const existCourseManagement = await this.courseManagementModel.findOne({
      courseNo: requestDTO.courseNo,
    });
    if (existCourseManagement) {
      const existSection = [];
      requestDTO.sections.forEach((e: any) => {
        existCourseManagement.sections.find(
          (sec: any) => sec.sectionNo == e.sectionNo,
        );
      });
      if (existSection.length) {
        throw new BadRequestException(
          `section ${existSection.map((e: string, index) => `${index == existSection.length - 1 ? e : e + ', '}`)} has been already added.`,
        );
      } else {
        await existCourseManagement.updateOne({
          updatedYear: requestDTO.updatedYear,
          updatedSemester: requestDTO.updatedSemester,
          $push: { sections: requestDTO.sections },
        });
      }
    } else {
      // const newCourseManagement: any =
      await this.courseManagementService.createCourseManagement(id, requestDTO);
    }
    requestDTO.sections.forEach((e: Section) => {
      if (requestDTO.type == COURSE_TYPE.SEL_TOPIC) {
        e.isProcessTQF3 = true;
      }
    });

    const newSecion = await this.sectionModel.insertMany(requestDTO.sections);

    let data: Course = {
      ...requestDTO,
      sections: newSecion.map((e) => e.id),
      addFirstTime: true,
    };
    if (requestDTO.type == COURSE_TYPE.GENERAL) {
      data.isProcessTQF3 = true;
    }
    const newCourse = await this.model.create(data);

    return await newCourse.populate([
      { path: 'academicYear' },
      { path: 'sections' },
    ]);
  }

  async updateCourse(id: string, requestDTO: any): Promise<Course> {
    const updateCourse: any = await this.model.findByIdAndUpdate(
      id,
      requestDTO,
    );
    await this.courseManagementModel.findOneAndUpdate(
      { courseNo: updateCourse.courseNo },
      requestDTO,
    );
    return { ...updateCourse._doc, ...requestDTO };
  }

  async deleteCourse(id: string): Promise<Course> {
    const deleteCourse = await this.model.findByIdAndDelete(id);
    await this.courseManagementModel.findOneAndDelete({
      courseNo: deleteCourse.courseNo,
    });
    return deleteCourse;
  }
}
