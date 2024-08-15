import { Module } from '@nestjs/common';
import { SectionService } from './service';
import { SectionController } from './controller';
import { MongooseModule } from '@nestjs/mongoose';
import { UserModel } from '../user/module';
import { Section, SectionSchema } from './schemas/schema';
import { CourseManagementModel } from '../courseManagement/module';
import { CourseModel } from '../course/module';
import { LogEventModel } from '../logEvent/module';
import { LogEventService } from '../logEvent/service';
import { FacultyModel } from '../faculty/module';
import { CourseManagementService } from '../courseManagement/service';
import { FacultyService } from '../faculty/service';

export const SectionModel = {
  name: Section.name,
  schema: SectionSchema,
};

@Module({
  imports: [
    MongooseModule.forFeature([
      SectionModel,
      // CourseModel,
      CourseManagementModel,
      // UserModel,
      // FacultyModel,
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
