import { Module } from '@nestjs/common';
import { CourseManagementService } from './service';
import { CourseManagementController } from './controller';
import { MongooseModule } from '@nestjs/mongoose';
import { CourseManagement, CourseManagementSchema } from './schemas/schema';
import { FacultyService } from '../faculty/service';
import { Faculty, FacultySchema } from '../faculty/schemas/schema';
import { User, UserSchema } from '../user/schemas/schema';
import { Course, CourseSchema } from '../course/schemas/schema';
import { Section, SectionSchema } from '../section/schemas/schema';

@Module({
  imports: [
    MongooseModule.forFeature([
      {
        name: CourseManagement.name,
        schema: CourseManagementSchema,
      },
      { name: Course.name, schema: CourseSchema },
      { name: Section.name, schema: SectionSchema },
      { name: User.name, schema: UserSchema },
      {
        name: Faculty.name,
        schema: FacultySchema,
      },
    ]),
  ],
  controllers: [CourseManagementController],
  providers: [CourseManagementService, FacultyService],
})
export class CourseManagementModule {}
