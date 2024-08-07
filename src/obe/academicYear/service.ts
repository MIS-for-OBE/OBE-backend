import { BadRequestException, Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { AcademicYear } from './schemas/schema';
import { AcademicYearSearchDTO } from './dto/search.dto';
import { LogEventService } from '../logEvent/service';
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
    try {
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
    } catch (error) {
      throw new BadRequestException(error?.message ?? error);
    }
  }

  async createAcademicYear(id: string, requestDTO: AcademicYear): Promise<any> {
    try {
      const res = await this.model.create({
        year: requestDTO.year,
        semester: requestDTO.semester,
      });
      // const logEventDTO = new LogEventDTO();
      // this.setLogEvent(logEventDTO, 'Create', res.semester, res.year);
      // await this.logEventService.createLogEvent(id, logEventDTO);
      return res;
    } catch (error) {
      throw new BadRequestException(error?.message ?? error);
    }
  }

  async activeAcademicYear(
    id: string,
    academicYearId: string,
  ): Promise<AcademicYear> {
    try {
      await this.model.findOneAndUpdate(
        { isActive: true },
        { isActive: false },
      );
      const res = await this.model.findByIdAndUpdate(
        academicYearId,
        { isActive: true },
        { new: true },
      );
      // const logEventDTO = new LogEventDTO();
      // this.setLogEvent(logEventDTO, 'Active', res.semester, res.year);
      // await this.logEventService.createLogEvent(id, logEventDTO);
      return res;
    } catch (error) {
      throw new BadRequestException(error?.message ?? error);
    }
  }

  async deleteAcademicYear(id: string): Promise<AcademicYear> {
    try {
      const res = await this.model.findByIdAndDelete(id);
      if (!res) {
        throw new BadRequestException('AcademicYear not found.');
      }
      // const logEventDTO = new LogEventDTO();
      // this.setLogEvent(logEventDTO, 'Delete', res.semester, res.year);
      // await this.logEventService.createLogEvent(id, logEventDTO);
      return res;
    } catch (error) {
      throw new BadRequestException(error?.message ?? error);
    }
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
