import { Module } from '@nestjs/common';
import { CourseManagementService } from './courseManagement.service';
import { CourseManagementController } from './courseManagement.controller';
import { MongooseModule } from '@nestjs/mongoose';
import {
  CourseManagement,
  CourseManagementSchema,
} from './schemas/courseManagement.schema';
import { FacultyService } from '../faculty/faculty.service';
import { Faculty, FacultySchema } from '../faculty/schemas/faculty.schema';
import {
  AcademicYear,
  AcademicYearSchema,
} from '../academicYear/schemas/academicYear.schema';
import { User, UserSchema } from '../user/schemas/user.schema';
import { Course, CourseSchema } from '../course/schemas/course.schema';
import { TQF3, TQF3Schema } from '../tqf3/schemas/tqf3.schema';
import { TQF5, TQF5Schema } from '../tqf5/schemas/tqf5.schema';
import { PLO, PLOSchema } from '../plo/schemas/plo.schema';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: CourseManagement.name, schema: CourseManagementSchema },
      { name: AcademicYear.name, schema: AcademicYearSchema },
      { name: Course.name, schema: CourseSchema },
      { name: User.name, schema: UserSchema },
      { name: Faculty.name, schema: FacultySchema },
      { name: PLO.name, schema: PLOSchema },
      { name: TQF3.name, schema: TQF3Schema },
      { name: TQF5.name, schema: TQF5Schema },
    ]),
  ],
  controllers: [CourseManagementController],
  providers: [CourseManagementService, FacultyService],
})
export class CourseManagementModule {}
