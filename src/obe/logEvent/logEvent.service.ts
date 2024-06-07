import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { LogEvent } from './schemas/logEvent.schema';
import { User } from '../user/schemas/user.schema';
import { LogEventSearchDTO } from './dto/search.dto';
import { LogEventDTO } from './dto/dto';

@Injectable()
export class LogEventService {
  constructor(
    @InjectModel(LogEvent.name) private readonly model: Model<LogEvent>,
  ) {}

  async searchLogEvent(searchDTO: LogEventSearchDTO): Promise<LogEvent[]> {
    return await this.model
      .find()
      .populate(
        'user',
        '-enrollCourses -ownCourses -coCourses -facultyCode -departmentCode',
      )
      .skip((searchDTO.page - 1) * searchDTO.limit)
      .limit(searchDTO.limit);
  }

  async createLogEvent(id: string, requestDTO: LogEventDTO): Promise<LogEvent> {
    return await this.model.create({
      user: id,
      type: requestDTO.type,
      event: requestDTO.event,
      course: requestDTO.course,
      sectionDetect: requestDTO.sectionDetect,
    });
  }
}
