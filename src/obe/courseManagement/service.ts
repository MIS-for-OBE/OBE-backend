import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { CourseManagement, CourseManagementDocument } from './schemas/schema';
import { ConfigService } from '@nestjs/config';
import { User } from '../user/schemas/schema';
import { LogEventDTO } from '../logEvent/dto/dto';
import { LOG_EVENT_TYPE } from 'src/common/enum/type.enum';
import { FacultyService } from '../faculty/service';

@Injectable()
export class CourseManagementService {
  constructor(
    @InjectModel(CourseManagement.name)
    private readonly model: Model<CourseManagement>,
    @InjectModel(User.name) private readonly userModel: Model<User>,
    private readonly facultyService: FacultyService,
    private readonly configService: ConfigService,
  ) {}

  async searchCourseManagement(
    facultyCode: string,
    searchDTO: any,
  ): Promise<CourseManagement[]> {
    try {
      const courseCode = await this.facultyService.getCourseCode(
        facultyCode,
        searchDTO.departmentCode,
      );
      return await this.model
        .find({
          courseNo: {
            $in: courseCode.map(
              (code) => new RegExp('^' + ('000' + code).slice(-3)),
            ),
          },
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
        })
        .sort([[searchDTO.orderBy, searchDTO.orderType]])
        .skip((searchDTO.page - 1) * searchDTO.limit)
        .limit(searchDTO.limit);
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

  async updateCourseManagement(
    id: string,
    requestDTO: any,
  ): Promise<CourseManagement> {
    try {
      const course = await this.model.findByIdAndUpdate(id, requestDTO, {
        new: true,
      });
      if (!course) {
        throw new NotFoundException('CourseManagement not found');
      }
      return course;
    } catch (error) {
      throw error;
    }
  }

  async deleteCourseManagement(id: string): Promise<CourseManagement> {
    try {
      const course = await this.model.findByIdAndDelete(id);
      if (!course) {
        throw new NotFoundException('CourseManagement not found');
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
