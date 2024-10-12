import { Module } from '@nestjs/common';
import { AcademicYearService } from './academicYear.service';
import { AcademicYearController } from './academicYear.controller';
import { MongooseModule } from '@nestjs/mongoose';
import {
  AcademicYear,
  AcademicYearSchema,
} from './schemas/academicYear.schema';

@Module({
  imports: [
    MongooseModule.forFeature([
      {
        name: AcademicYear.name,
        schema: AcademicYearSchema,
      },
    ]),
  ],
  controllers: [AcademicYearController],
  providers: [AcademicYearService],
})
export class AcademicYearModule {}
