import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import mongoose, { Model } from 'mongoose';
import { Course } from './schemas/schema';
import { User } from '../user/schemas/schema';
import { Section } from '../section/schemas/schema';
import { CourseManagementService } from '../courseManagement/service';
import { CourseManagement } from '../courseManagement/schemas/schema';
import { COURSE_TYPE } from 'src/common/enum/type.enum';
import { CourseSearchDTO } from './dto/search.dto';
import {
  setWhereWithSearchCourse,
  sortData,
} from 'src/common/function/function';
import { ROLE } from 'src/common/enum/role.enum';
import { TEXT_ENUM } from 'src/common/enum/text.enum';

@Injectable()
export class CourseService {
  constructor(
    @InjectModel(Course.name) private readonly model: Model<Course>,
    @InjectModel(Section.name) private readonly sectionModel: Model<Section>,
    @InjectModel(CourseManagement.name)
    private readonly courseManagementModel: Model<CourseManagement>,
    @InjectModel(User.name) private readonly userModel: Model<User>,
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
          setWhereWithSearchCourse(where, searchDTO.search);
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
          const topics = course.sections
            .map((sec: any) => {
              if (
                sec.instructor.id == id ||
                sec.coInstructors.some((coIns: any) => coIns.id == id)
              )
                return sec.topic;
            })
            .filter((topic) => topic);

          course.sections = course.sections.filter(
            (section: any) => !section.topic || topics.includes(section.topic),
          );
          sortData(course.sections, 'sectionNo');
          sortData(course.sections, 'isActive', 'boolean');
          return course;
        });
        if (searchDTO.page == 1) {
          const totalCount = await this.model.countDocuments(where);
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
      const topics = course.sections
        .map((sec: any) => {
          if (
            sec.instructor.id == id ||
            sec.coInstructors.some((coIns: any) => coIns.id == id)
          )
            return sec.topic;
        })
        .filter((topic) => topic);
      course.sections = course.sections.filter(
        (section: any) => !section.topic || topics.includes(section.topic),
      );
      sortData(course.sections, 'sectionNo');
      sortData(course.sections, 'isActive', 'boolean');
      return course;
    } catch (error) {
      throw error;
    }
  }

  async getExistsCourseName(courseNo: string): Promise<String> {
    try {
      const course = await this.courseManagementModel.findOne({
        courseNo,
      });
      if (course) return course.courseName;
      else return '';
    } catch (error) {
      throw error;
    }
  }

  async checkCanCreateCourse(requestDTO: any): Promise<any> {
    try {
      const existCourseManagement = await this.courseManagementModel.findOne({
        courseNo: requestDTO.courseNo,
      });

      if (existCourseManagement) {
        const existSection = [];
        requestDTO.sections.forEach((section: any) => {
          if (
            existCourseManagement.sections.find(
              (existSec: any) => existSec.sectionNo == section,
            )
          ) {
            existSection.push(section);
          }
        });
        if (existSection.length) {
          throw new BadRequestException({
            title: 'Section existing',
            message: `Section ${existSection.map((sec) => ('000' + sec).slice(-3)).join(', ')} has been already added.`,
          });
        }
      }
      return TEXT_ENUM.Success;
    } catch (error) {
      throw error;
    }
  }

  async createCourse(id: string, requestDTO: any): Promise<any> {
    try {
      const coInstructors = [
        ...new Set(
          requestDTO.sections
            .flatMap((sec) => sec.coInstructors)
            .filter((email) => email.endsWith('@cmu.ac.th')),
        ),
      ].map((email) => ({ email, role: ROLE.INSTRUCTOR }));

      for (const instructor of coInstructors) {
        let user = await this.userModel.findOne({
          email: instructor.email,
        });
        if (!user) {
          user = await this.userModel.create(instructor);
        }
        requestDTO.sections.forEach((sec) => {
          sec.coInstructors = sec.coInstructors.map((value) =>
            value === instructor.email ? user.id : value,
          );
        });
      }

      const existCourseManagement = await this.courseManagementModel.findOne({
        courseNo: requestDTO.courseNo,
      });

      if (existCourseManagement) {
        // const existSection = [];
        // requestDTO.sections.forEach((section: any) => {
        //   if (
        //     existCourseManagement.sections.find(
        //       (existSec: any) => existSec.sectionNo == section.sectionNo,
        //     )
        //   ) {
        //     existSection.push(section.sectionNo);
        //   }
        // });
        // if (existSection.length) {
        //   throw new BadRequestException(
        //     `Section ${existSection.join(', ')} has been already added.`,
        //   );
        // } else {
        await existCourseManagement.updateOne({
          updatedYear: requestDTO.updatedYear,
          updatedSemester: requestDTO.updatedSemester,
          courseName: requestDTO.courseName,
          $push: { sections: requestDTO.sections },
        });
        // }
      } else {
        await this.courseManagementModel.create(requestDTO);
      }

      const newSecion = await this.sectionModel.insertMany(
        requestDTO.sections.filter((sec) => sec.openThisTerm),
      );

      const courseData: Course = {
        ...requestDTO,
        sections: newSecion.map((section) => section.id),
        addFirstTime: true,
      };

      let course = await this.model.findOne({
        academicYear: requestDTO.academicYear,
        courseNo: requestDTO.courseNo,
      });
      if (course) {
        await course.updateOne(
          {
            courseName: requestDTO.courseName,
            $push: { sections: courseData.sections },
          },
          { new: true },
        );
        course = await this.model.findOne({
          academicYear: requestDTO.academicYear,
          courseNo: requestDTO.courseNo,
        });
      } else {
        if (courseData.sections.length) {
          course = await this.model.create(courseData);
        }
      }
      if (course) {
        await course.populate({
          path: 'sections',
          populate: [
            { path: 'instructor', select: 'firstNameEN lastNameEN email' },
            { path: 'coInstructors', select: 'firstNameEN lastNameEN email' },
          ],
        });
        const topics = course.sections
          .map((sec: any) => {
            if (
              sec.instructor.id == id ||
              sec.coInstructors.some((coIns: any) => coIns.id == id)
            )
              return sec.topic;
          })
          .filter((topic) => topic);
        course.sections = course.sections.filter(
          (section: any) => !section.topic || topics.includes(section.topic),
        );
      }
      return course ?? [];
    } catch (error) {
      throw error;
    }
  }

  async updateCourse(id: string, requestDTO: any): Promise<Course> {
    try {
      const currentCourse = await this.model.findById(id);
      if (!currentCourse) {
        throw new NotFoundException('Course not found');
      }
      if (currentCourse.addFirstTime) {
        await this.courseManagementModel.findOneAndUpdate(
          { courseNo: currentCourse.courseNo },
          requestDTO,
        );
      }
      await this.model.findByIdAndUpdate(id, requestDTO);

      return { id, ...requestDTO };
    } catch (error) {
      if (error.code == 11000) {
        throw new BadRequestException('Course No already exists');
      }
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
      if (deleteCourse.addFirstTime) {
        await this.courseManagementModel.findOneAndDelete({
          courseNo: deleteCourse.courseNo,
        });
      }
      return deleteCourse;
    } catch (error) {
      throw error;
    }
  }

  async leaveCourse(userId: string, id: string): Promise<Course> {
    try {
      const leaveCourse = await this.model.findById(id);
      if (!leaveCourse) {
        throw new NotFoundException('Course not found');
      }
      await this.sectionModel.updateMany(
        { _id: { $in: leaveCourse.sections } },
        { $pull: { coInstructors: userId } },
      );
      await this.courseManagementModel.findOneAndUpdate(
        { courseNo: leaveCourse.courseNo },
        { $pull: { 'sections.$[].coInstructors': userId } },
      );
      return leaveCourse;
    } catch (error) {
      throw error;
    }
  }
}
