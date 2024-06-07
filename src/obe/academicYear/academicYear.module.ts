import { Module } from '@nestjs/common';
import { AcademicYearService } from './academicYear.service';
import { AcademicYearController } from './academicYear.controller';
import { MongooseModule } from '@nestjs/mongoose';
import {
  AcademicYear,
  AcademicYearSchema,
} from './schemas/academicYear.schema';
import { LogEventService } from '../logEvent/logEvent.service';
import { LogEventModel } from '../logEvent/logEvent.module';

export const AcademicYearModel = {
  name: AcademicYear.name,
  schema: AcademicYearSchema,
};

@Module({
  imports: [MongooseModule.forFeature([AcademicYearModel, LogEventModel])],
  controllers: [AcademicYearController],
  providers: [AcademicYearService, LogEventService],
})
export class AcademicYearModule {}
