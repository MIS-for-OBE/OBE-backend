import { Module } from '@nestjs/common';
import { AcademicYearService } from './academicYear.service';
import { AcademicYearController } from './academicYear.controller';
import { MongooseModule } from '@nestjs/mongoose';
import {
  AcademicYear,
  AcademicYearSchema,
} from './schemas/academicYear.schema';

export const AcademicYearModel = {
  name: AcademicYear.name,
  schema: AcademicYearSchema,
};

@Module({
  imports: [MongooseModule.forFeature([AcademicYearModel])],
  controllers: [AcademicYearController],
  providers: [AcademicYearService],
})
export class AcademicYearModule {}
