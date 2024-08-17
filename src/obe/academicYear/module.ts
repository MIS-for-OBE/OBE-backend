import { Module } from '@nestjs/common';
import { AcademicYearService } from './service';
import { AcademicYearController } from './controller';
import { MongooseModule } from '@nestjs/mongoose';
import { AcademicYear, AcademicYearSchema } from './schemas/schema';
import { LogEventService } from '../logEvent/service';
import { LogEvent, LogEventSchema } from '../logEvent/schemas/schema';

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
