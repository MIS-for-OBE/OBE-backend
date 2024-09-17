import { Module } from '@nestjs/common';
import { CourseService } from './service';
import { CourseController } from './controller';
import { MongooseModule } from '@nestjs/mongoose';
import { Course, CourseSchema } from './schemas/schema';
import { FacultyService } from '../faculty/service';
import {
  CourseManagement,
  CourseManagementSchema,
} from '../courseManagement/schemas/schema';
import { Faculty, FacultySchema } from '../faculty/schemas/schema';
import { Section, SectionSchema } from '../section/schemas/schema';
import { User, UserSchema } from '../user/schemas/schema';
import { TQF3, TQF3Schema } from '../tqf3/schemas/schema';
import { TQF5, TQF5Schema } from '../tqf5/schemas/schema';

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
      { name: TQF3.name, schema: TQF3Schema },
      { name: TQF5.name, schema: TQF5Schema },
    ]),
  ],
  controllers: [CourseController],
  providers: [CourseService, FacultyService],
})
export class CourseModule {}
