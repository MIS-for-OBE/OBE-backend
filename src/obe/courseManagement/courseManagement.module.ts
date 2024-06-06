import { Module } from '@nestjs/common';
import { CourseManagementService } from './courseManagement.service';
import { CourseManagementController } from './courseManagement.controller';
import { MongooseModule } from '@nestjs/mongoose';
import {
  CourseManagement,
  CourseManagementSchema,
} from './schemas/courseManagement.schema';

export const CourseManagementModel = {
  name: CourseManagement.name,
  schema: CourseManagementSchema,
};

@Module({
  imports: [MongooseModule.forFeature([CourseManagementModel])],
  controllers: [CourseManagementController],
  providers: [CourseManagementService],
})
export class CourseManagementModule {}
