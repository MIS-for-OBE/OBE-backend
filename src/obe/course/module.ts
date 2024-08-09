import { Module } from '@nestjs/common';
import { CourseService } from './service';
import { CourseController } from './controller';
import { MongooseModule } from '@nestjs/mongoose';
import { UserModel } from '../user/module';
import { CourseManagementModel } from '../courseManagement/module';
import { Course, CourseSchema } from './schemas/schema';
import { SectionModel } from '../section/module';
import { CourseManagementService } from '../courseManagement/service';
import { FacultyService } from '../faculty/service';
import { FacultyModel } from '../faculty/module';

export const CourseModel = { name: Course.name, schema: CourseSchema };

@Module({
  imports: [
    MongooseModule.forFeature([
      CourseModel,
      SectionModel,
      CourseManagementModel,
      UserModel,
      FacultyModel,
    ]),
  ],
  controllers: [CourseController],
  providers: [CourseService, CourseManagementService, FacultyService],
})
export class CourseModule {}
