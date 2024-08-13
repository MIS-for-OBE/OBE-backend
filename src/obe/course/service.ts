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
import { setWhereWithSearchCourse } from 'src/common/function/function';
import { ROLE } from 'src/common/enum/role.enum';

@Injectable()
export class CourseService {
  constructor(
    @InjectModel(Course.name) private readonly model: Model<Course>,
    @InjectModel(Section.name) private readonly sectionModel: Model<Section>,
    @InjectModel(CourseManagement.name)
    private readonly courseManagementModel: Model<CourseManagement>,
    private readonly courseManagementService: CourseManagementService,
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
              {
                path: 'instructor',
                select: '_id firstNameEN lastNameEN email',
              },
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
              {
                path: 'instructor',
                select: '_id firstNameEN lastNameEN email',
              },
              {
                path: 'coInstructors',
                select: '_id firstNameEN lastNameEN email',
              },
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
            { path: 'instructor', select: '_id firstNameEN lastNameEN email' },
            {
              path: 'coInstructors',
              select: '_id firstNameEN lastNameEN email',
            },
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
          return;
        }
      }
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
          $push: { sections: requestDTO.sections },
        });
        // }
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

      const newSecion = await this.sectionModel.insertMany(
        requestDTO.sections.filter((sec) => sec.openThisTerm),
      );

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
        if (courseData.sections.length) {
          course = await this.model.create(courseData);
        }
      }
      if (course) {
        await course.populate({
          path: 'sections',
          populate: [
            { path: 'instructor', select: '_id firstNameEN lastNameEN email' },
            {
              path: 'coInstructors',
              select: '_id firstNameEN lastNameEN email',
            },
          ],
        });
        course.sections = course.sections.filter(
          (section: any) =>
            section.instructor.id == id ||
            section.coInstructors.some((coIns: any) => coIns.id == id),
        );
      }
      return course ?? [];
    } catch (error) {
      throw error;
    }
  }

  async updateCourse(id: string, requestDTO: any): Promise<Course> {
    try {
      const updateCourse = await this.model.findByIdAndUpdate(id, requestDTO, {
        new: true,
      });
      if (!updateCourse) {
        throw new NotFoundException('Course not found');
      }
      return updateCourse;
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
