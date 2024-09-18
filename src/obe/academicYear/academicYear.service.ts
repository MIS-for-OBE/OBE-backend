import { Injectable, NotFoundException } from '@nestjs/common';
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
    try {
      if (searchDTO.manage) {
        return await this.model.find().sort([
          [searchDTO.orderBy, searchDTO.orderType],
          ['semester', searchDTO.orderType],
        ]);
      } else {
        const academicYear = await this.model.find().sort([
          ['year', 'desc'],
          ['semester', 'desc'],
        ]);
        const index = academicYear.findIndex((e) => e.isActive);
        if (index >= 0) return academicYear.slice(index, index + 15);
        else return [];
      }
    } catch (error) {
      throw error;
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
      throw error;
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
      throw error;
    }
  }

  async updateProcessTqf3(
    id: string,
    academicYearId: string,
    requestDTO: any,
  ): Promise<AcademicYear> {
    try {
      const res = await this.model.findByIdAndUpdate(
        academicYearId,
        { isProcessTQF3: requestDTO.isProcessTQF3 },
        { new: true },
      );
      return res;
    } catch (error) {
      throw error;
    }
  }

  async deleteAcademicYear(id: string): Promise<AcademicYear> {
    try {
      const res = await this.model.findByIdAndDelete(id);
      if (!res) {
        throw new NotFoundException('AcademicYear not found.');
      }
      // const logEventDTO = new LogEventDTO();
      // this.setLogEvent(logEventDTO, 'Delete', res.semester, res.year);
      // await this.logEventService.createLogEvent(id, logEventDTO);
      return res;
    } catch (error) {
      throw error;
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
