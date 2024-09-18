import { Module } from '@nestjs/common';
import { AcademicYearService } from './academicYear.service';
import { AcademicYearController } from './academicYear.controller';
import { MongooseModule } from '@nestjs/mongoose';
import { AcademicYear, AcademicYearSchema } from './schemas/academicYear.schema';
import { LogEventService } from '../logEvent/logEvent.service';
import { LogEvent, LogEventSchema } from '../logEvent/schemas/logEvent.schema';

@Module({
  imports: [
    MongooseModule.forFeature([
      {
        name: AcademicYear.name,
        schema: AcademicYearSchema,
      },
      {
        name: LogEvent.name,
        schema: LogEventSchema,
      },
    ]),
  ],
  controllers: [AcademicYearController],
  providers: [AcademicYearService, LogEventService],
})
export class AcademicYearModule {}
