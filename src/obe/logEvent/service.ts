import { BadRequestException, Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { LogEvent } from './schemas/schema';
import { LogEventSearchDTO } from './dto/search.dto';
import { LogEventDTO } from './dto/dto';

@Injectable()
export class LogEventService {
  constructor(
    @InjectModel(LogEvent.name) private readonly model: Model<LogEvent>,
  ) {}

  async searchLogEvent(searchDTO: LogEventSearchDTO): Promise<LogEvent[]> {
    try {
      const res = await this.model
        .find()
        .where(searchDTO.type ? { type: searchDTO.type } : {})
        .populate(
          'user',
          '-enrollCourses -ownCourses -coCourses -facultyCode -departmentCode',
        )
        .sort([[searchDTO.orderBy, searchDTO.orderType]])
        .skip((searchDTO.page - 1) * searchDTO.limit)
        .limit(searchDTO.limit);
      return res;
    } catch (error) {
      throw new BadRequestException(error?.message ?? error);
    }
  }

  async createLogEvent(id: string, requestDTO: LogEventDTO): Promise<LogEvent> {
    try {
      return await this.model.create({
        user: id,
        type: requestDTO.type,
        event: requestDTO.event,
        course: requestDTO.course,
        sectionDetect: requestDTO.sectionDetect,
      });
    } catch (error) {
      throw new BadRequestException(error?.message ?? error);
    }
  }
}
