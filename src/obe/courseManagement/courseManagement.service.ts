import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import {
  CourseManagement,
  CourseManagementDocument,
} from './schemas/courseManagement.schema';
import { ConfigService } from '@nestjs/config';
import { User } from '../user/schemas/user.schema';
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
    return await this.model
      .find()
      .skip((searchDTO.page - 1) * searchDTO.limit)
      .limit(searchDTO.limit);
  }

  async createCourseManagement(
    id: string,
    requestDTO: CourseManagementDocument,
  ): Promise<CourseManagement> {
    return await this.model.create(requestDTO);
  }

  async updateCourseManagement(
    id: string,
    requestDTO: any,
  ): Promise<CourseManagement> {
    return await this.model.findByIdAndUpdate(id, requestDTO, { new: true });
  }

  async deleteCourseManagement(id: string): Promise<CourseManagement> {
    return await this.model.findByIdAndDelete(id);
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
