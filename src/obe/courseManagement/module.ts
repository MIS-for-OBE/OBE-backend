import { Module } from '@nestjs/common';
import { CourseManagementService } from './service';
import { CourseManagementController } from './controller';
import { MongooseModule } from '@nestjs/mongoose';
import { CourseManagement, CourseManagementSchema } from './schemas/schema';
import { FacultyService } from '../faculty/service';
import { Faculty, FacultySchema } from '../faculty/schemas/schema';
import {
  AcademicYear,
  AcademicYearSchema,
} from '../academicYear/schemas/schema';
import { User, UserSchema } from '../user/schemas/schema';
import { Course, CourseSchema } from '../course/schemas/schema';
import { Section, SectionSchema } from '../section/schemas/schema';
import { TQF3, TQF3Schema } from '../tqf3/schemas/schema';
import { TQF5, TQF5Schema } from '../tqf5/schemas/schema';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: CourseManagement.name, schema: CourseManagementSchema },
      { name: AcademicYear.name, schema: AcademicYearSchema },
      { name: Course.name, schema: CourseSchema },
      { name: Section.name, schema: SectionSchema },
      { name: User.name, schema: UserSchema },
      { name: Faculty.name, schema: FacultySchema },
      { name: TQF3.name, schema: TQF3Schema },
      { name: TQF5.name, schema: TQF5Schema },
    ]),
  ],
  controllers: [CourseManagementController],
  providers: [CourseManagementService, FacultyService],
})
export class CourseManagementModule {}
