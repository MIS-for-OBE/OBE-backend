import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import {
  AcademicYear,
  AcademicYearDocument,
} from './schemas/academicYear.schema';
import { AcademicYearSearchDTO } from './dto/search.dto';
import { LogEventService } from '../logEvent/logEvent.service';
import { LOG_EVENT_TYPE } from 'src/common/enum/type.enum';
import { LogEventDTO } from '../logEvent/dto/dto';
import { now } from 'lodash';

@Injectable()
export class AcademicYearService {
  constructor(
    @InjectModel(AcademicYear.name) private readonly model: Model<AcademicYear>,
    private readonly logEventService: LogEventService,
  ) {}

  async searchAcademicYear(
    searchDTO: AcademicYearSearchDTO,
  ): Promise<AcademicYear[]> {
    return await this.model
      .find()
      .populate('creator')
      .populate('modifier')
      .skip((searchDTO.page - 1) * searchDTO.limit)
      .limit(searchDTO.limit);
  }

  async createAcademicYear(id: string, requestDTO: AcademicYear): Promise<any> {
    const res = await this.model.create({
      year: requestDTO.year,
      semester: requestDTO.semester,
      creator: id,
      modifier: id,
    });
    const logEventDTO = new LogEventDTO();
    logEventDTO.type = LOG_EVENT_TYPE.ADMIN;
    logEventDTO.event = this.setEventDesc('Create', res.semester, res.year);
    await this.logEventService.createLogEvent(id, logEventDTO);
    return res;
  }

  async activeAcademicYear(
    id: string,
    academicYearId: string,
  ): Promise<AcademicYear> {
    await this.model.findOneAndUpdate({ isActive: true }, { isActive: false });
    const res = await this.model.findByIdAndUpdate(
      academicYearId,
      {
        isActive: true,
        modifier: id,
        updatedAt: now(),
      },
      { new: true },
    );
    const logEventDTO = new LogEventDTO();
    logEventDTO.type = LOG_EVENT_TYPE.ADMIN;
    logEventDTO.event = this.setEventDesc('Active', res.semester, res.year);
    await this.logEventService.createLogEvent(id, logEventDTO);
    return res;
  }

  async deleteAcademicYear(id: string): Promise<AcademicYear> {
    const res = await this.model.findByIdAndDelete(id);
    const logEventDTO = new LogEventDTO();
    logEventDTO.type = LOG_EVENT_TYPE.ADMIN;
    logEventDTO.event = this.setEventDesc('Delete', res.semester, res.year);
    await this.logEventService.createLogEvent(id, logEventDTO);
    return res;
  }

  private setEventDesc(action: string, semester: number, year: number) {
    return `${action} Academic Year ${semester}/${year}`;
  }
}
