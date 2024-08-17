import { Module } from '@nestjs/common';
import { CourseService } from './service';
import { CourseController } from './controller';
import { MongooseModule } from '@nestjs/mongoose';
import { Course, CourseSchema } from './schemas/schema';
import { CourseManagementService } from '../courseManagement/service';
import { FacultyService } from '../faculty/service';
import {
  CourseManagement,
  CourseManagementSchema,
} from '../courseManagement/schemas/schema';
import { Faculty, FacultySchema } from '../faculty/schemas/schema';
import { Section, SectionSchema } from '../section/schemas/schema';
import { User, UserSchema } from '../user/schemas/schema';

export const CourseModel = { name: Course.name, schema: CourseSchema };

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: Course.name, schema: CourseSchema },
      {
        name: Section.name,
        schema: SectionSchema,
      },
      {
        name: CourseManagement.name,
        schema: CourseManagementSchema,
      },
      { name: User.name, schema: UserSchema },
      {
        name: Faculty.name,
        schema: FacultySchema,
      },
    ]),
  ],
  controllers: [CourseController],
  providers: [CourseService, CourseManagementService, FacultyService],
})
export class CourseModule {}
