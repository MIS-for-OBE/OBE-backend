import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { CourseManagement, CourseManagementDocument } from './schemas/schema';
import { ConfigService } from '@nestjs/config';
import { User } from '../user/schemas/schema';
import { LogEventDTO } from '../logEvent/dto/dto';
import { LOG_EVENT_TYPE } from 'src/common/enum/type.enum';
import { FacultyService } from '../faculty/service';
import { setWhereWithSearchCourse } from 'src/common/function/function';
import { CourseManagementSearchDTO } from './dto/search.dto';
import { Course } from '../course/schemas/schema';
import { Section } from '../section/schemas/schema';

@Injectable()
export class CourseManagementService {
  constructor(
    @InjectModel(CourseManagement.name)
    private readonly model: Model<CourseManagement>,
    @InjectModel(Course.name) private readonly courseModel: Model<Course>,
    @InjectModel(Section.name) private readonly sectionModel: Model<Section>,
    @InjectModel(User.name) private readonly userModel: Model<User>,
    private readonly facultyService: FacultyService,
    private readonly configService: ConfigService,
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
      if (searchDTO.search.length) {
        setWhereWithSearchCourse(where, searchDTO.search);
      }
      const courses = await this.model
        .find(where)
        .populate({
          path: 'sections',
          populate: [
            { path: 'instructor', select: '_id firstNameEN lastNameEN email' },
            {
              path: 'coInstructors',
              select: '_id firstNameEN lastNameEN email',
            },
          ],
        })
        .sort([[searchDTO.orderBy, searchDTO.orderType]])
        .skip((searchDTO.page - 1) * searchDTO.limit)
        .limit(searchDTO.limit);
      courses.forEach((course) => {
        course.sections.sort((a, b) => a.sectionNo - b.sectionNo);
      });
      if (searchDTO.page == 1 && !searchDTO.search.length) {
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
      const isDuplicateSectionNo = updateCourse.sections.some(
        (sec: any) =>
          sec.sectionNo === requestDTO.data.sectionNo &&
          sec.id !== params.section,
      );
      if (isDuplicateSectionNo) {
        throw new BadRequestException('Section No already exists');
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
        .sort([['sectionNo', 'asc']]);
      if (!updateCourse) {
        throw new NotFoundException('SectionManagement not found');
      }
      updateCourse = updateCourse.sections.sort(
        (a, b) => a.sectionNo - b.sectionNo,
      );
      const course: any = await this.courseModel
        .findOne({
          academicYear: requestDTO.academicYear,
          courseNo: requestDTO.courseNo,
        })
        .populate('sections');
      if (course) {
        const secId = course.sections.find(
          (sec) => sec.sectionNo == requestDTO.oldSectionNo,
        ).id;
        if (secId) {
          await this.sectionModel.findByIdAndUpdate(secId, requestDTO.data);
        }
        return { updateCourse, courseId: course.id, secId };
      }
      return { updateCourse };
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

  async deleteSectionManagement(params: any): Promise<CourseManagement> {
    try {
      const course = await this.model.findByIdAndUpdate(
        params.id,
        { $pull: { sections: { id: params.section } } },
        { new: true },
      );
      if (!course) {
        throw new NotFoundException('SectionManagement not found');
      }
      return course;
    } catch (error) {
      throw error;
    }
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
