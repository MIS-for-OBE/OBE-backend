import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { AcademicYear } from './schemas/academicYear.schema';
import { AcademicYearSearchDTO } from './dto/search.dto';
import { LogEventService } from '../logEvent/logEvent.service';
import { LOG_EVENT_TYPE } from 'src/common/enum/type.enum';
import { LogEventDTO } from '../logEvent/dto/dto';

@Injectable()
export class AcademicYearService {
  constructor(
    @InjectModel(AcademicYear.name) private readonly model: Model<AcademicYear>,
    private readonly logEventService: LogEventService,
  ) {}

  async searchAcademicYear(
    searchDTO: AcademicYearSearchDTO,
  ): Promise<AcademicYear[]> {
    const academicYear = await this.model
      .find()
      .sort([
        [searchDTO.orderBy, searchDTO.orderType],
        ['semester', searchDTO.orderType],
      ])
      .skip((searchDTO.page - 1) * searchDTO.limit)
      .limit(searchDTO.limit);
    if (searchDTO.manage) {
      return academicYear;
    } else {
      const index = academicYear.findIndex((e) => e.isActive);
      return academicYear.slice(index, index + 15);
    }
  }

  async createAcademicYear(id: string, requestDTO: AcademicYear): Promise<any> {
    const res = await this.model.create({
      year: requestDTO.year,
      semester: requestDTO.semester,
    });
    // const logEventDTO = new LogEventDTO();
    // this.setLogEvent(logEventDTO, 'Create', res.semester, res.year);
    // await this.logEventService.createLogEvent(id, logEventDTO);
    return res;
  }

  async activeAcademicYear(
    id: string,
    academicYearId: string,
  ): Promise<AcademicYear> {
    await this.model.findOneAndUpdate({ isActive: true }, { isActive: false });
    const res = await this.model.findByIdAndUpdate(
      academicYearId,
      { isActive: true },
      { new: true },
    );
    // const logEventDTO = new LogEventDTO();
    // this.setLogEvent(logEventDTO, 'Active', res.semester, res.year);
    // await this.logEventService.createLogEvent(id, logEventDTO);
    return res;
  }

  async deleteAcademicYear(id: string): Promise<AcademicYear> {
    const res = await this.model.findByIdAndDelete(id);
    // const logEventDTO = new LogEventDTO();
    // this.setLogEvent(logEventDTO, 'Delete', res.semester, res.year);
    // await this.logEventService.createLogEvent(id, logEventDTO);
    return res;
  }

  private setLogEvent(
    logEventDTO: LogEventDTO,
    action: string,
    semester: number,
    year: number,
  ) {
    logEventDTO.type = LOG_EVENT_TYPE.ADMIN;
    logEventDTO.event = `${action} Academic Year ${semester}/${year}`;
  }
}
