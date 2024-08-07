import { Module } from '@nestjs/common';
import { AcademicYearService } from './service';
import { AcademicYearController } from './controller';
import { MongooseModule } from '@nestjs/mongoose';
import {
  AcademicYear,
  AcademicYearSchema,
} from './schemas/schema';
import { LogEventService } from '../logEvent/service';
import { LogEventModel } from '../logEvent/module';

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
