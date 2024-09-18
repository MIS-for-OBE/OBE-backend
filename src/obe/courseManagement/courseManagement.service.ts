import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import mongoose, { Model } from 'mongoose';
import {
  CourseManagement,
  CourseManagementDocument,
} from './schemas/courseManagement.schema';
import { ConfigService } from '@nestjs/config';
import { User } from '../user/schemas/user.schema';
import { LogEventDTO } from '../logEvent/dto/dto';
import {
  COURSE_TYPE,
  LOG_EVENT_TYPE,
  TQF_STATUS,
} from 'src/common/enum/type.enum';
import { FacultyService } from '../faculty/faculty.service';
import {
  setWhereWithSearchCourse,
  sortData,
} from 'src/common/function/function';
import { CourseManagementSearchDTO } from './dto/search.dto';
import { AcademicYear } from '../academicYear/schemas/academicYear.schema';
import { Course } from '../course/schemas/course.schema';
import { Section } from '../section/schemas/section.schema';
import { TEXT_ENUM } from 'src/common/enum/text.enum';
import { ROLE } from 'src/common/enum/role.enum';
import { TQF3 } from '../tqf3/schemas/tqf3.schema';
import { TQF5 } from '../tqf5/schemas/tqf5.schema';

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
    @InjectModel(TQF3.name) private readonly tqf3Model: Model<TQF3>,
    @InjectModel(TQF5.name) private readonly tqf5Model: Model<TQF5>,
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
      if (searchDTO.isPloMapping) {
        delete courseCode[Object.keys(courseCode)[0]];
      }
      const where = {
        courseNo: {
          $in: Object.values(courseCode).map(
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
            {
              path: 'instructor',
              select: 'firstNameEN lastNameEN firstNameTH lastNameTH email',
            },
            {
              path: 'coInstructors',
              select: 'firstNameEN lastNameEN firstNameTH lastNameTH email',
            },
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
        return { totalCount, courses, courseCode };
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
      if (error.code == 11000) {
        throw new BadRequestException('Course No already exists');
      }
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
            {
              path: 'instructor',
              select: 'firstNameEN lastNameEN firstNameTH lastNameTH email',
            },
            {
              path: 'coInstructors',
              select: 'firstNameEN lastNameEN firstNameTH lastNameTH email',
            },
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
      updateSection.type = updateCourse.type;
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
          secId = await this.createSection(updateSection, { ...requestDTO });
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
        let secId = await this.createSection(updateSection, { ...requestDTO });
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

  async updateCoInsSections(authUser: any, requestDTO: any): Promise<any> {
    try {
      let updateCourse = await this.model.findOne({
        courseNo: requestDTO.courseNo,
      });
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
        sec.coInstructors = sec.coInstructors?.map(
          (email) => emailToId.get(email) || email,
        );
      });
      updateCourse.sections.forEach((sec) => {
        sec.coInstructors =
          requestDTO.data.find((item) => item.sectionNo == sec.sectionNo)
            ?.coInstructors ?? sec.coInstructors;
      });
      await updateCourse.save();
      let course = await this.courseModel
        .findOne({
          academicYear: requestDTO.academicYear,
          courseNo: requestDTO.courseNo,
        })
        .populate('sections');

      if (course) {
        const updateSectionPromises = course.sections.map((sec: any) => {
          const coInstructors = requestDTO.data.find(
            (item) => item.sectionNo == sec.sectionNo,
          )?.coInstructors;
          if (coInstructors) {
            return this.sectionModel.findByIdAndUpdate(sec.id, {
              coInstructors,
            });
          }
          return;
        });
        await Promise.all(updateSectionPromises);
      }
      const populateSections = {
        path: 'sections',
        populate: [
          {
            path: 'instructor',
            select: 'firstNameEN lastNameEN firstNameTH lastNameTH email',
          },
          {
            path: 'coInstructors',
            select: 'firstNameEN lastNameEN firstNameTH lastNameTH email',
          },
        ],
      };
      [updateCourse, course] = await Promise.all([
        this.model
          .findOne({ courseNo: requestDTO.courseNo })
          .populate(populateSections)
          .select('-sections.isActive')
          .sort([['sectionNo', 'asc']]),
        this.courseModel
          .findOne({
            academicYear: requestDTO.academicYear,
            courseNo: requestDTO.courseNo,
          })
          .populate(populateSections),
      ]);
      if (course) {
        const topics = course.sections
          .map((sec: any) => {
            if (
              sec.instructor.id == authUser.id ||
              sec.coInstructors.some((coIns: any) => coIns.id == authUser.id)
            )
              return sec.topic;
          })
          .filter((topic) => topic);
        course.sections = course.sections.filter(
          (section: any) => !section.topic || topics.includes(section.topic),
        );
        sortData(course.sections, 'sectionNo');
        sortData(course.sections, 'isActive', 'boolean');
      }
      return { course, courseManagement: updateCourse };
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

      if (deleteCourse) {
        await Promise.all([
          deleteCourse.sections.map(async (section: any) => {
            if (section.TQF3) {
              await this.tqf3Model.findByIdAndDelete(section.TQF3);
            }
            if (section.TQF5) {
              await this.tqf5Model.findByIdAndDelete(section.TQF5);
            }
            await this.sectionModel.findByIdAndDelete(section._id);
          }),
          this.tqf3Model.findByIdAndDelete(deleteCourse.TQF3),
          this.tqf5Model.findByIdAndDelete(deleteCourse.TQF5),
        ]);
      }

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

  async ploMapping(authUser: any, requestDTO: any): Promise<any> {
    try {
      const updateCourses = await Promise.all(
        requestDTO.data.map(async (course) => {
          if (course.sections) {
            const updatedSections = course.sections.map((section) => {
              return this.model.findByIdAndUpdate(
                course.id,
                { $set: { 'sections.$[elem].plos': section.plos } },
                { arrayFilters: [{ 'elem.topic': section.topic }] },
              );
            });
            return await Promise.all(updatedSections);
          } else {
            return await this.model.findByIdAndUpdate(course.id, {
              plos: course.plos,
            });
          }
        }),
      );
      return updateCourses;
    } catch (error) {
      throw error;
    }
  }

  private async createSection(course: any, requestDTO: any) {
    const data = course.find(
      (sec) => sec.sectionNo == requestDTO.data.sectionNo,
    )._doc;
    delete data._id;
    if (course.type == COURSE_TYPE.SEL_TOPIC) {
      const tqf3 = await this.tqf3Model.create({
        status: TQF_STATUS.NO_DATA,
      });
      const tqf5 = await this.tqf5Model.create({
        status: TQF_STATUS.NO_DATA,
      });
      data.TQF3 = tqf3.id;
      data.TQF5 = tqf5.id;
    }

    return await this.sectionModel.create({ ...data });
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
