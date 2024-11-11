import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Course } from './schemas/course.schema';
import { User } from '../user/schemas/user.schema';
import { CourseManagement } from '../courseManagement/schemas/courseManagement.schema';
import { CourseSearchDTO } from './dto/search.dto';
import {
  setWhereWithSearchCourse,
  sortData,
} from 'src/common/function/function';
import { ROLE } from 'src/common/enum/role.enum';
import { TEXT_ENUM } from 'src/common/enum/text.enum';
import { COURSE_TYPE, TQF_STATUS } from 'src/common/enum/type.enum';
import { TQF3 } from '../tqf3/schemas/tqf3.schema';
import { TQF5 } from '../tqf5/schemas/tqf5.schema';
import axios from 'axios';
import {
  CmuApiTqfCourseSearchDTO,
  CmuApiTqfCourseDTO,
} from 'src/common/cmu-api/cmu-api.dto';
import { FacultyService } from '../faculty/faculty.service';

@Injectable()
export class CourseService {
  constructor(
    @InjectModel(Course.name) private readonly model: Model<Course>,
    @InjectModel(CourseManagement.name)
    private readonly courseManagementModel: Model<CourseManagement>,
    @InjectModel(User.name) private readonly userModel: Model<User>,
    @InjectModel(TQF3.name) private readonly tqf3Model: Model<TQF3>,
    @InjectModel(TQF5.name) private readonly tqf5Model: Model<TQF5>,
    private readonly facultyService: FacultyService,
  ) {}

  async searchCourse(authUser: any, searchDTO: CourseSearchDTO): Promise<any> {
    try {
      if (searchDTO.manage) {
        const courseCode = await this.facultyService.getCourseCode(
          authUser.facultyCode,
          searchDTO.departmentCode,
        );
        const where = {
          year: searchDTO.year,
          semester: searchDTO.semester,
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
              { path: 'TQF3' },
              { path: 'TQF5' },
            ],
          })
          .populate('TQF3')
          .populate('TQF5')
          .sort({ [searchDTO.orderBy]: searchDTO.orderType })
          .skip((searchDTO.page - 1) * searchDTO.limit)
          .limit(searchDTO.limit);
        if (searchDTO.page == 1) {
          const totalCount = await this.model.countDocuments(where);
          return { totalCount, courses, courseCode };
        }
        return courses;
      } else {
        const where = {
          year: searchDTO.year,
          semester: searchDTO.semester,
          sections: {
            $elemMatch: {
              $or: [
                { instructor: authUser.id },
                { coInstructors: authUser.id },
              ],
            },
          },
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
                select: 'firstNameEN lastNameEN firstNameTH lastNameTH email',
              },
              {
                path: 'coInstructors',
                select: 'firstNameEN lastNameEN firstNameTH lastNameTH email',
              },
              {
                path: 'students',
                populate: [
                  {
                    path: 'student',
                    select:
                      'studentId firstNameEN lastNameEN firstNameTH lastNameTH',
                  },
                ],
              },
              { path: 'TQF3', select: 'status' },
              { path: 'TQF5', select: 'status' },
            ],
          })
          .populate('TQF3', 'status')
          .populate('TQF5', 'status')
          .sort({ [searchDTO.orderBy]: searchDTO.orderType })
          .skip((searchDTO.page - 1) * searchDTO.limit)
          .limit(searchDTO.limit);
        const filterCourses = courses.map((course) => {
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

  async searchOneCourse(authUser: any, searchDTO: any): Promise<Course> {
    try {
      const course = await this.model
        .findOne({
          year: searchDTO.year,
          semester: searchDTO.semester,
          courseNo: searchDTO.courseNo,
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
            {
              path: 'students',
              populate: [
                {
                  path: 'student',
                  select:
                    'studentId firstNameEN lastNameEN firstNameTH lastNameTH',
                },
              ],
            },
            { path: 'TQF3' },
            { path: 'TQF5' },
          ],
        })
        .populate('TQF3')
        .populate('TQF5');
      if (!course) {
        throw new NotFoundException('Course not found');
      }
      const topics = course.sections
        .map((sec: any) => {
          if (
            [ROLE.SUPREME_ADMIN, ROLE.ADMIN].includes(authUser.role) ||
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
      return course;
    } catch (error) {
      throw error;
    }
  }

  async getExistsCourseName(
    courseNo: string,
    requestDTO: any,
  ): Promise<String> {
    try {
      const course = await this.courseManagementModel.findOne({
        courseNo,
      });
      if (course) return course.courseName;
      else {
        const courseInfo = await axios.get(
          `${process.env.BASE_CMU_API}course-template`,
          {
            params: {
              courseid: courseNo,
              ...requestDTO,
            } as CmuApiTqfCourseSearchDTO,
          },
        );
        if (courseInfo.data.length) {
          const data: CmuApiTqfCourseDTO = courseInfo.data[0];
          return data.CourseTitleEng;
        } else return '';
      }
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

      let [existCourseManagement, course] = await Promise.all([
        this.courseManagementModel.findOne({
          courseNo: requestDTO.courseNo,
        }),
        this.model.findOne({
          year: requestDTO.year,
          semester: requestDTO.semester,
          courseNo: requestDTO.courseNo,
        }),
      ]);
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

      let tqf3, tqf5;
      if (
        course &&
        course.type == COURSE_TYPE.SEL_TOPIC &&
        course.sections.some((e) => requestDTO.sections[0].topic == e.topic)
      ) {
        tqf3 = course.sections.find(
          (sec) => sec.topic == requestDTO.sections[0].topic,
        ).TQF3;
        tqf5 = course.sections.find(
          (sec) => sec.topic == requestDTO.sections[0].topic,
        ).TQF5;
      } else if (!course || requestDTO.type == COURSE_TYPE.SEL_TOPIC) {
        tqf3 = (await this.tqf3Model.create({ status: TQF_STATUS.NO_DATA })).id;
        tqf5 = (await this.tqf5Model.create({ status: TQF_STATUS.NO_DATA })).id;
      }
      requestDTO.sections.forEach((sec) => {
        if (!course?.addFirstTime) sec.addFirstTime = true;
        if (requestDTO.type == COURSE_TYPE.SEL_TOPIC) {
          sec.TQF3 = tqf3;
          sec.TQF5 = tqf5;
        }
      });

      if (existCourseManagement) {
        if (requestDTO.sections.find((sec) => sec.semester.length)) {
          await existCourseManagement.updateOne({
            updatedYear: requestDTO.year,
            updatedSemester: requestDTO.semester,
            courseName: requestDTO.courseName,
            $push: {
              sections: requestDTO.sections.filter(
                (sec) => sec.semester.length,
              ),
            },
          });
        }
      } else {
        requestDTO.updatedYear = requestDTO.year;
        requestDTO.updatedSemester = requestDTO.semester;
        await this.courseManagementModel.create(requestDTO);
      }

      const courseData: Course = {
        ...requestDTO,
        sections: requestDTO.sections.filter((sec) => sec.openThisTerm),
        addFirstTime: true,
      };

      if (!course && courseData.type != COURSE_TYPE.SEL_TOPIC) {
        courseData.TQF3 = tqf3;
        courseData.TQF5 = tqf5;
      }

      if (course) {
        await course.updateOne(
          {
            courseName: requestDTO.courseName,
            $push: { sections: courseData.sections },
          },
          { new: true },
        );
        course = await this.model.findOne({
          year: requestDTO.year,
          semester: requestDTO.semester,
          courseNo: requestDTO.courseNo,
        });
      } else {
        if (courseData.sections.length) {
          course = await this.model.create({ ...courseData });
        }
      }
      if (course) {
        await course.populate([
          {
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
              { path: 'TQF3', select: 'status' },
              { path: 'TQF5', select: 'status' },
            ],
          },
          { path: 'TQF3', select: 'status' },
          { path: 'TQF5', select: 'status' },
        ]);
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
      return course ?? {};
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
      const leaveCourse = await this.model.findByIdAndUpdate(id, {
        sections: { $pull: { coInstructors: userId } },
      });
      if (!leaveCourse) {
        throw new NotFoundException('Course not found');
      }
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
