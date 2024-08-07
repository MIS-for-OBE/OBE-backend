import { Module } from '@nestjs/common';
import { CourseManagementService } from './service';
import { CourseManagementController } from './controller';
import { MongooseModule } from '@nestjs/mongoose';
import {
  CourseManagement,
  CourseManagementSchema,
} from './schemas/schema';
import { UserModel } from '../user/module';

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
