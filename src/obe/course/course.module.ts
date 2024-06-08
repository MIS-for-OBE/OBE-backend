import { Module } from '@nestjs/common';
import { CourseService } from './course.service';
import { CourseController } from './course.controller';
import { MongooseModule } from '@nestjs/mongoose';
import { UserModel } from '../user/user.module';
import { CourseManagementModel } from '../courseManagement/courseManagement.module';
import { Course, CourseSchema } from './schemas/course.schema';
import { SectionModel } from '../section/section.module';
import { CourseManagementService } from '../courseManagement/courseManagement.service';

export const CourseModel = { name: Course.name, schema: CourseSchema };

@Module({
  imports: [
    MongooseModule.forFeature([
      CourseModel,
      SectionModel,
      CourseManagementModel,
      UserModel,
    ]),
  ],
  controllers: [CourseController],
  providers: [CourseService, CourseManagementService],
})
export class CourseModule {}
