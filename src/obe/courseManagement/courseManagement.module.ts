import { Module } from '@nestjs/common';
import { CourseManagementService } from './courseManagement.service';
import { CourseManagementController } from './courseManagement.controller';
import { MongooseModule } from '@nestjs/mongoose';
import {
  CourseManagement,
  CourseManagementSchema,
} from './schemas/courseManagement.schema';
import { UserModel } from '../user/user.module';

export const CourseManagementModel = {
  name: CourseManagement.name,
  schema: CourseManagementSchema,
};

@Module({
  imports: [MongooseModule.forFeature([CourseManagementModel, UserModel])],
  controllers: [CourseManagementController],
  providers: [CourseManagementService],
})
export class CourseManagementModule {}
