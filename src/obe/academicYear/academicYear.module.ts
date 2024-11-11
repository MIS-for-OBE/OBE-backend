import { Module } from '@nestjs/common';
import { AcademicYearService } from './academicYear.service';
import { AcademicYearController } from './academicYear.controller';
import { MongooseModule } from '@nestjs/mongoose';
import {
  AcademicYear,
  AcademicYearSchema,
} from './schemas/academicYear.schema';
import { Course, CourseSchema } from '../course/schemas/course.schema';
import { CourseManagement, CourseManagementSchema } from '../courseManagement/schemas/courseManagement.schema';
import { TQF3, TQF3Schema } from '../tqf3/schemas/tqf3.schema';
import { TQF5, TQF5Schema } from '../tqf5/schemas/tqf5.schema';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: AcademicYear.name, schema: AcademicYearSchema },
      { name: Course.name, schema: CourseSchema },
      { name: CourseManagement.name, schema: CourseManagementSchema },
      { name: TQF3.name, schema: TQF3Schema },
      { name: TQF5.name, schema: TQF5Schema },
    ]),
  ],
  controllers: [AcademicYearController],
  providers: [AcademicYearService],
})
export class AcademicYearModule {}
