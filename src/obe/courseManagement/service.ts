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

@Injectable()
export class CourseManagementService {
  constructor(
    @InjectModel(CourseManagement.name)
    private readonly model: Model<CourseManagement>,
    @InjectModel(User.name) private readonly userModel: Model<User>,
    private readonly configService: ConfigService,
  ) {}

  async searchCourseManagement(searchDTO: any): Promise<CourseManagement[]> {
    try {
      return await this.model
        .find()
        .sort([[searchDTO.orderBy, searchDTO.orderType]])
        .skip((searchDTO.page - 1) * searchDTO.limit)
        .limit(searchDTO.limit);
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
      const res = await this.model.findByIdAndUpdate(id, requestDTO, {
        new: true,
      });
      if (!res) {
        throw new NotFoundException('CourseManagement not found');
      }
      return res;
    } catch (error) {
      throw error;
    }
  }

  async deleteCourseManagement(id: string): Promise<CourseManagement> {
    try {
      const res = await this.model.findByIdAndDelete(id);
      if (!res) {
        throw new NotFoundException('CourseManagement not found');
      }
      return res;
    } catch (error) {
      throw error;
    }
  }

  private setLogEvent(
    logEventDTO: LogEventDTO,
    action: string,
    courseNo: number,
  ) {
    logEventDTO.type = LOG_EVENT_TYPE.COURSE_MANAGEMENT;
    logEventDTO.event = `${action} Course ${courseNo}`;
  }
}
