import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import mongoose, { Model } from 'mongoose';
import { CourseManagement, CourseManagementDocument } from './schemas/schema';
import { ConfigService } from '@nestjs/config';
import { User } from '../user/schemas/schema';
import { LogEventDTO } from '../logEvent/dto/dto';
import { LOG_EVENT_TYPE } from 'src/common/enum/type.enum';
import { FacultyService } from '../faculty/service';
import { setWhereWithSearchCourse } from 'src/common/function/function';
import { CourseManagementSearchDTO } from './dto/search.dto';
import { AcademicYear } from '../academicYear/schemas/schema';
import { Course } from '../course/schemas/schema';
import { Section } from '../section/schemas/schema';
import { TEXT_ENUM } from 'src/common/enum/text.enum';
import { ROLE } from 'src/common/enum/role.enum';

@Injectable()
export class CourseManagementService {
  constructor(
    @InjectModel(CourseManagement.name)
    private readonly model: Model<CourseManagement>,
    @InjectModel(Course.name) private readonly courseModel: Model<Course>,
    @InjectModel(Section.name) private readonly sectionModel: Model<Section>,
    @InjectModel(AcademicYear.name)
    private readonly academicYearModel: Model<AcademicYear>,
    @InjectModel(User.name) private readonly userModel: Model<User>,
    private readonly facultyService: FacultyService,
  ) {}

  async searchCourseManagement(
    facultyCode: string,
    searchDTO: CourseManagementSearchDTO,
  ): Promise<any> {
    try {
      const courseCode = await this.facultyService.getCourseCode(
        facultyCode,
        searchDTO.departmentCode,
      );
      const where = {
        courseNo: {
          $in: courseCode.map(
            (code) => new RegExp('^' + ('000' + code).slice(-3)),
          ),
        },
      };
      if (searchDTO.search?.length) {
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
      const activeTerm = await this.academicYearModel.findOne({
        isActive: true,
      });
      const activeCourses = await this.courseModel
        .find({
          academicYear: activeTerm.id,
          ...where,
        })
        .populate('sections');
      courses.forEach((course) => {
        course.sections.sort((a, b) => a.sectionNo - b.sectionNo);
        const curCourse = activeCourses.find(
          (e) => e.courseNo == course.courseNo,
        );
        if (curCourse) {
          course.sections.forEach((sec) => {
            sec.isActive =
              curCourse.sections.find((e) => e.sectionNo == sec.sectionNo)
                ?.isActive || false;
          });
        } else {
          course.sections.forEach((sec) => (sec.isActive = false));
        }
      });
      if (searchDTO.page == 1) {
        const totalCount = await this.model.countDocuments(where);
        return { totalCount, courses };
      }
      return courses;
    } catch (error) {
      throw error;
    }
  }

  async searchOneCourseManagement(searchDTO: any): Promise<CourseManagement> {
    try {
      const course = await this.model.findOne({
        courseNo: searchDTO.courseNo,
      });
      if (!course) {
        throw new NotFoundException('Course not found');
      }
      return course;
    } catch (error) {
      throw error;
    }
  }

  async createCourseManagement(
    id: string,
    requestDTO: CourseManagementDocument,
  ): Promise<CourseManagement> {
    try {
      return await this.model.create(requestDTO);
    } catch (error) {
      throw error;
    }
  }

  async checkCanCreateSection(requestDTO: any): Promise<any> {
    try {
      const courseManagement = await this.model.findById(requestDTO.id);
      if (courseManagement) {
        const existSection = [];
        requestDTO.sections.forEach((section: any) => {
          if (
            courseManagement.sections.find(
              (existSec: any) => existSec.sectionNo == section.sectionNo,
            )
          ) {
            existSection.push(section.sectionNo);
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

  async createSectionManagement(id: string, requestDTO: any): Promise<any> {
    try {
      const updateCourse = await this.model.findByIdAndUpdate(
        id,
        { $push: { sections: requestDTO.sections } },
        { new: true },
      );
      return updateCourse;
    } catch (error) {
      throw error;
    }
  }

  async updateCourseManagement(id: string, requestDTO: any): Promise<any> {
    try {
      const course = await this.model.findByIdAndUpdate(id, requestDTO, {
        new: true,
      });
      if (!course) {
        throw new NotFoundException('CourseManagement not found');
      }
      const updateCourse = await this.courseModel.findOneAndUpdate(
        {
          academicYear: requestDTO.academicYear,
          courseNo: requestDTO.oldCourseNo,
        },
        requestDTO,
        { new: true },
      );
      return { id, ...requestDTO, courseId: updateCourse.id };
    } catch (error) {
      throw error;
    }
  }

  async updateSectionManagement(params: any, requestDTO: any): Promise<any> {
    try {
      let updateCourse: any = await this.model.findById(params.id);
      if (!updateCourse) {
        throw new NotFoundException('CourseManagement not found');
      }
      let instructor = requestDTO.data.instructor;
      if (instructor && instructor.endsWith('@cmu.ac.th')) {
        let user = await this.userModel.findOne({ email: instructor });
        if (!user) {
          user = await this.userModel.create({
            email: instructor,
            role: ROLE.INSTRUCTOR,
          });
        }
        requestDTO.data.instructor = user.id;
      } else {
        const isDuplicateSectionNo = updateCourse.sections.some(
          (sec: any) =>
            sec.sectionNo === requestDTO.data.sectionNo &&
            sec.id !== params.section,
        );
        if (isDuplicateSectionNo) {
          throw new BadRequestException('Section No already exists');
        }
      }
      const updateFields = {};
      for (const key in requestDTO.data) {
        updateFields[`sections.$[sec].${key}`] = requestDTO.data[key];
      }
      updateCourse = await this.model
        .findByIdAndUpdate(
          params.id,
          { $set: updateFields },
          { arrayFilters: [{ 'sec._id': params.section }], new: true },
        )
        .populate({
          path: 'sections',
          populate: [
            { path: 'instructor', select: 'firstNameEN lastNameEN email' },
            { path: 'coInstructors', select: 'firstNameEN lastNameEN email' },
          ],
        })
        .select('-sections.isActive')
        .sort([['sectionNo', 'asc']]);
      if (!updateCourse) {
        throw new NotFoundException('SectionManagement not found');
      }
      const updateSection = updateCourse.sections.sort(
        (a, b) => a.sectionNo - b.sectionNo,
      );
      let course: any = await this.courseModel
        .findOne({
          academicYear: requestDTO.academicYear,
          courseNo: requestDTO.courseNo,
        })
        .populate('sections');
      if (course) {
        if (!requestDTO.oldSectionNo) {
          requestDTO.oldSectionNo = requestDTO.data.sectionNo;
        }
        let secId = course.sections.find(
          (sec) => sec.sectionNo == requestDTO.oldSectionNo,
        )?.id;
        if (secId) {
          await this.sectionModel.findByIdAndUpdate(secId, {
            ...requestDTO.data,
            isActive: requestDTO.openThisTerm,
          });
        } else if (requestDTO.openThisTerm) {
          secId = await this.createSection(updateSection, requestDTO);
          await this.courseModel.findOneAndUpdate(
            {
              academicYear: requestDTO.academicYear,
              courseNo: requestDTO.courseNo,
            },
            { $push: { sections: secId._id } },
            { new: true },
          );
        }
        return {
          updateSection: updateSection.find((sec) => sec.id == params.section),
          courseId: course.id,
          secId,
        };
      } else if (requestDTO.openThisTerm) {
        let secId = await this.createSection(updateSection, requestDTO);
        course = await this.courseModel.create({
          academicYear: requestDTO.academicYear,
          courseNo: requestDTO.courseNo,
          courseName: updateCourse.courseName,
          type: updateCourse.type,
          sections: [secId],
        });
      }
      return {
        updateSection: updateSection.find((sec) => sec.id == params.section),
      };
    } catch (error) {
      throw error;
    }
  }

  async updateCoInsSections(
    courseId: string,
    requestDTO: any,
  ): Promise<CourseManagement> {
    try {
      let updateCourse: any = await this.model.findById(courseId);
      if (!updateCourse) {
        throw new NotFoundException('CourseManagement not found');
      }
      const emails = requestDTO.data
        .flatMap((sec) => sec.coInstructors)
        .filter((email) => email.endsWith('@cmu.ac.th'));
      const uniqueEmails = [...new Set(emails)];
      const users = await Promise.all(
        uniqueEmails.map(async (email) => {
          let user = await this.userModel.findOne({ email });
          if (!user) {
            user = await this.userModel.create({
              email,
              role: ROLE.INSTRUCTOR,
            });
          }
          return { email, id: user.id };
        }),
      );
      const emailToId = new Map(users.map(({ email, id }) => [email, id]));
      requestDTO.data.forEach((sec) => {
        sec.coInstructors = sec.coInstructors.map(
          (email) => emailToId.get(email) || email,
        );
      });

      const updatePromises = requestDTO.data.map((item) => {
        return this.model.findOneAndUpdate(
          { id: courseId, 'sections.sectionNo': item.sectionNo },
          { $set: { 'sections.$.coInstructors': item.coInstructors } },
          { new: true },
        );
      });
      await Promise.all(updatePromises);

      let course = await this.courseModel
        .findOne({
          academicYear: requestDTO.academicYear,
          courseNo: requestDTO.courseNo,
        })
        .populate('sections');

      if (course) {
        const updateSectionPromises = course.sections.map((sec: any) => {
          return this.sectionModel.findByIdAndUpdate(sec.id, {
            coInstructors:
              requestDTO.data.find((item) => item.sectionNo == sec.sectionNo)
                .coInstructors || [],
          });
        });
        await Promise.all(updateSectionPromises);
      }
      updateCourse = await this.model
        .findById(courseId)
        .populate({
          path: 'sections',
          populate: [
            { path: 'instructor', select: 'firstNameEN lastNameEN email' },
            { path: 'coInstructors', select: 'firstNameEN lastNameEN email' },
          ],
        })
        .select('-sections.isActive')
        .sort([['sectionNo', 'asc']]);
      return updateCourse;
    } catch (error) {
      throw error;
    }
  }

  async deleteCourseManagement(id: string, requestDTO: any): Promise<any> {
    try {
      const course = await this.model.findByIdAndDelete(id);
      if (!course) {
        throw new NotFoundException('CourseManagement not found');
      }
      const deleteCourse = await this.courseModel.findOneAndDelete({
        academicYear: requestDTO.academicYear,
        courseNo: requestDTO.courseNo,
      });
      return { id, courseId: deleteCourse.id };
    } catch (error) {
      throw error;
    }
  }

  async deleteSectionManagement(params: any, requestDTO: any): Promise<any> {
    try {
      const updateCourse = await this.model.findByIdAndUpdate(
        params.id,
        { $pull: { sections: { _id: params.section } } },
        { new: true },
      );
      if (!updateCourse) {
        throw new NotFoundException('SectionManagement not found');
      }
      const course: any = await this.courseModel
        .findOne({
          academicYear: requestDTO.academicYear,
          courseNo: requestDTO.courseNo,
        })
        .populate('sections');
      if (course) {
        const secId = course.sections.find(
          (sec) => sec.sectionNo == requestDTO.sectionNo,
        )?.id;
        if (secId) {
          await Promise.all([
            this.courseModel.findByIdAndUpdate(course.id, {
              $pull: { sections: secId },
            }),
            this.sectionModel.findByIdAndDelete(secId),
          ]);
        }
        return { updateCourse, courseId: course.id, secId };
      }
      return updateCourse;
    } catch (error) {
      throw error;
    }
  }

  private async createSection(course: any, requestDTO: any) {
    const data = course.find(
      (sec) => sec.sectionNo == requestDTO.data.sectionNo,
    )._doc;
    delete data._id;
    return await this.sectionModel.create(data);
  }

  private setLogEvent(
    logEventDTO: LogEventDTO,
    action: string,
    courseNo: string,
  ) {
    logEventDTO.type = LOG_EVENT_TYPE.COURSE_MANAGEMENT;
    logEventDTO.event = `${action} Course ${courseNo}`;
  }
}
