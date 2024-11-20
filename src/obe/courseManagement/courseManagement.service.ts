import {
  BadRequestException,
  Injectable,
  InternalServerErrorException,
  NotFoundException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import {
  CourseManagement,
  CourseManagementDocument,
} from './schemas/courseManagement.schema';
import { User } from '../user/schemas/user.schema';
import { COURSE_TYPE, TQF_STATUS } from 'src/common/enum/type.enum';
import { FacultyService } from '../faculty/faculty.service';
import {
  setWhereWithSearchCourse,
  sortData,
} from 'src/common/function/function';
import { CourseManagementSearchDTO } from './dto/search.dto';
import { AcademicYear } from '../academicYear/schemas/academicYear.schema';
import { Course } from '../course/schemas/course.schema';
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
      let coursesQuery = this.model
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
        .sort({ [searchDTO.orderBy]: searchDTO.orderType });
      if (!searchDTO.ignorePage) {
        coursesQuery = coursesQuery
          .skip((searchDTO.page - 1) * searchDTO.limit)
          .limit(searchDTO.limit);
      }
      let courses: any = await coursesQuery.exec();
      await this.setIsActiveSections(where, courses);
      if (searchDTO.page == 1) {
        const totalCount = await this.model.countDocuments(where);
        return { totalCount, courses, courseCode };
      }
      return courses;
    } catch (error) {
      throw error;
    }
  }

  async searchOneCourseManagement(searchDTO: any): Promise<any> {
    try {
      const where = {
        courseNo: searchDTO.courseNo,
      };
      const course = await this.model.findOne(where).populate({
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
      });
      course?.sections.sort((a, b) => a.sectionNo - b.sectionNo);
      await this.setIsActiveSections(where, [course]);
      return course || {};
    } catch (error) {
      throw new InternalServerErrorException(error.message);
    }
  }

  private async setIsActiveSections(where: any, courses: CourseManagement[]) {
    const activeTerm = await this.academicYearModel.findOne({
      isActive: true,
    });
    const activeCourses = await this.courseModel.find({
      year: activeTerm.year,
      semester: activeTerm.semester,
      ...where,
    });
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
  }

  async createCourseManagement(
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

  // async createSectionManagement(id: string, requestDTO: any): Promise<any> {
  //   try {
  //     const updateCourse = await this.model.findByIdAndUpdate(
  //       id,
  //       { $push: { sections: requestDTO.sections } },
  //       { new: true },
  //     );
  //     return updateCourse;
  //   } catch (error) {
  //     throw error;
  //   }
  // }

  async updateCourseManagement(id: string, requestDTO: any): Promise<any> {
    try {
      const course = await this.model.findByIdAndUpdate(id, requestDTO, {
        new: true,
      });
      if (!course) {
        throw new NotFoundException('CourseManagement not found');
      }
      const updateCourse = await this.courseModel
        .findOneAndUpdate(
          {
            year: requestDTO.year,
            semester: requestDTO.semester,
            courseNo: requestDTO.oldCourseNo,
          },
          requestDTO,
          { new: true },
        )
        .select('-sections');
      return { id, ...requestDTO, courseId: updateCourse?.id };
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
      const oldSection = updateCourse.sections.find(
        (sec: any) => sec.id === params.section,
      );
      const oldTopic = oldSection?.topic;
      const newTopic = requestDTO.data.topic;

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
        .select('-sections.isActive')
        .sort({ sectionNo: 'asc' });
      if (!updateCourse) {
        throw new NotFoundException('SectionManagement not found');
      }
      const updateSection = updateCourse.sections.sort(
        (a, b) => a.sectionNo - b.sectionNo,
      );
      updateSection.type = updateCourse.type;
      let course = await this.courseModel.findOne({
        year: requestDTO.year,
        semester: requestDTO.semester,
        courseNo: requestDTO.courseNo,
      });
      if (oldTopic && newTopic && oldTopic !== newTopic) {
        await Promise.all([
          this.model.findOneAndUpdate(
            { courseNo: requestDTO.courseNo },
            { $set: { 'sections.$[sec].topic': newTopic } },
            { arrayFilters: [{ 'sec.topic': oldTopic }] },
          ),
        ]);
      }
      if (course) {
        if (!requestDTO.oldSectionNo) {
          requestDTO.oldSectionNo = requestDTO.data.sectionNo;
        }
        let existSec = course.sections.find(
          (sec) => sec.sectionNo == requestDTO.oldSectionNo,
        );
        if (existSec) {
          course.sections = course.sections.map((sec) => {
            if (sec.sectionNo === requestDTO.oldSectionNo) {
              if (sec.topic && sec.topic === requestDTO.oldTopic) {
                sec.topic = requestDTO.newTopic;
              }
              return {
                ...sec,
                ...requestDTO.data,
                isActive: requestDTO.openThisTerm,
              };
            }
            return sec;
          });
          course.markModified('sections');
          await course.save();
        } else if (requestDTO.openThisTerm) {
          const newSectionData = await this.createSection(
            updateSection.find((sec) => sec.id == params.section)._doc,
            requestDTO,
          );
          await this.courseModel.findOneAndUpdate(
            {
              year: requestDTO.year,
              semester: requestDTO.semester,
              courseNo: requestDTO.courseNo,
            },
            { $push: { sections: newSectionData } },
            { new: true },
          );
        }
        return {
          updateSection: updateSection.find((sec) => sec.id == params.section),
          courseId: course.id,
          secId: (existSec as any)?.id,
        };
      } else if (requestDTO.openThisTerm) {
        const newSectionData = await this.createSection(
          updateSection.find((sec) => sec.id == params.section)._doc,
          requestDTO,
        );
        const data: any = {
          year: requestDTO.year,
          semester: requestDTO.semester,
          courseNo: requestDTO.courseNo,
          courseName: updateCourse.courseName,
          type: updateCourse.type,
          sections: [newSectionData],
        };
        if (updateCourse.type != COURSE_TYPE.SEL_TOPIC) {
          const [tqf3, tqf5] = await Promise.all([
            this.tqf3Model.create({ status: TQF_STATUS.NO_DATA }),
            this.tqf5Model.create({ status: TQF_STATUS.NO_DATA }),
          ]);
          data.TQF3 = tqf3.id;
          data.TQF5 = tqf5.id;
        }
        course = await this.courseModel.create(data);
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
      let updateCourse = await this.model.findOne({
        courseNo: requestDTO.courseNo,
      });
      if (requestDTO.actionType == 'courseManagement') {
        if (!updateCourse) {
          throw new NotFoundException('CourseManagement not found');
        }
        updateCourse.sections.forEach((sec) => {
          sec.coInstructors =
            requestDTO.data.find((item) => item.sectionNo == sec.sectionNo)
              ?.coInstructors ?? sec.coInstructors;
        });
        await updateCourse.save();
      }
      let course = await this.courseModel.findOne({
        year: requestDTO.year,
        semester: requestDTO.semester,
        courseNo: requestDTO.courseNo,
      });

      if (course) {
        course.sections.forEach((sec: any) => {
          sec.coInstructors =
            requestDTO.data.find((item) => item.sectionNo == sec.sectionNo)
              ?.coInstructors ?? sec.coInstructors;
        });
        await course.save();
      }
      [updateCourse, course] = await Promise.all([
        this.model
          .findOne({ courseNo: requestDTO.courseNo })
          .select('-sections.isActive')
          .sort({ sectionNo: 'asc' }),
        this.courseModel
          .findOne({
            year: requestDTO.year,
            semester: requestDTO.semester,
            courseNo: requestDTO.courseNo,
          })
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
          .select(
            '-sections.TQF3 -sections.TQF5 -sections.assignments -sections.students',
          ),
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
        year: requestDTO.year,
        semester: requestDTO.semester,
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
        throw new NotFoundException('CourseManagement not found');
      }
      const course: any = await this.courseModel.findOne({
        year: requestDTO.year,
        semester: requestDTO.semester,
        courseNo: requestDTO.courseNo,
      });
      if (course) {
        const delSec = course.sections.find(
          (sec) => sec.sectionNo == requestDTO.sectionNo,
        );
        if (delSec) {
          const updatedCourse = await this.courseModel.findByIdAndUpdate(
            course.id,
            { $pull: { sections: { _id: delSec.id } } },
            { new: true },
          );
          if (
            course.type == COURSE_TYPE.SEL_TOPIC &&
            !updatedCourse.sections.some((sec) => sec.topic == delSec.topic)
          ) {
            await Promise.all([
              this.tqf3Model.findByIdAndDelete(delSec.TQF3),
              this.tqf5Model.findByIdAndDelete(delSec.TQF5),
            ]);
          }
        }
        return { updateCourse, courseId: course?.id, secId: delSec?.id };
      }
      return updateCourse;
    } catch (error) {
      throw error;
    }
  }

  async ploMapping(requestDTO: any): Promise<any> {
    try {
      const updateCourses = await Promise.all(
        requestDTO.data.map(async (course) => {
          if (course.sections) {
            const updatedSections = course.sections.map((section) => {
              return this.model.findByIdAndUpdate(
                course.id,
                { $set: { 'sections.$[elem].ploRequire': section.ploRequire } },
                { arrayFilters: [{ 'elem.topic': section.topic }], new: true },
              );
            });
            return await Promise.all(updatedSections);
          } else {
            return await this.model.findByIdAndUpdate(
              course.id,
              { ploRequire: course.ploRequire },
              { new: true },
            );
          }
        }),
      );
      return updateCourses;
    } catch (error) {
      throw error;
    }
  }

  private async createSection(update, requestDTO: any) {
    if (requestDTO.type == COURSE_TYPE.SEL_TOPIC) {
      const existTopic = await this.courseModel
        .findOne({ 'sections.topic': requestDTO.data.topic })
        .select('sections.$');
      let tqf3, tqf5;
      if (existTopic) {
        tqf3 = existTopic.sections[0].TQF3;
        tqf5 = existTopic.sections[0].TQF5;
      } else {
        tqf3 = (await this.tqf3Model.create({ status: TQF_STATUS.NO_DATA })).id;
        tqf5 = (await this.tqf5Model.create({ status: TQF_STATUS.NO_DATA })).id;
      }
      return {
        ...update,
        ...requestDTO.data,
        TQF3: tqf3,
        TQF5: tqf5,
      };
    }
    return { ...update, ...requestDTO.data };
  }
}
