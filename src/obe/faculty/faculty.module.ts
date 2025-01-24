import { FacultyService } from './faculty.service';
import { FacultyController } from './faculty.controller';
import { Module } from '@nestjs/common';
import { Faculty, FacultySchema } from './schemas/faculty.schema';
import { MongooseModule } from '@nestjs/mongoose';
import { PLO, PLOSchema } from '../plo/schemas/plo.schema';
import { Course, CourseSchema } from '../course/schemas/course.schema';
import {
  CourseManagement,
  CourseManagementSchema,
} from '../courseManagement/schemas/courseManagement.schema';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: Faculty.name, schema: FacultySchema },
      { name: PLO.name, schema: PLOSchema },
      { name: Course.name, schema: CourseSchema },
      { name: CourseManagement.name, schema: CourseManagementSchema },
    ]),
  ],
  controllers: [FacultyController],
  providers: [FacultyService],
})
export class FacultyModule {}
