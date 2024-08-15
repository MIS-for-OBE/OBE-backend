import { Module } from '@nestjs/common';
import { SectionService } from './service';
import { SectionController } from './controller';
import { MongooseModule } from '@nestjs/mongoose';
import { UserModel } from '../user/module';
import { Section, SectionSchema } from './schemas/schema';
import { CourseManagementModel } from '../courseManagement/module';
import { LogEventModel } from '../logEvent/module';
import { LogEventService } from '../logEvent/service';
import { FacultyModel } from '../faculty/module';
import { CourseManagementService } from '../courseManagement/service';
import { FacultyService } from '../faculty/service';
import { CourseService } from '../course/service';
import { Course, CourseSchema } from '../course/schemas/schema';

export const SectionModel = {
  name: Section.name,
  schema: SectionSchema,
};

@Module({
  imports: [
    MongooseModule.forFeature([
      SectionModel,
      CourseManagementModel,
      { name: Course.name, schema: CourseSchema },
      // UserModel,
      // FacultyModel,
      // LogEventModel,
    ]),
  ],
  controllers: [SectionController],
  providers: [
    SectionService,
    // CourseManagementService,
    // FacultyService,
    // LogEventService,
  ],
})
export class SectionModule {}
