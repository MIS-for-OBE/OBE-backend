import { Module } from '@nestjs/common';
import { CourseManagementService } from './service';
import { CourseManagementController } from './controller';
import { MongooseModule } from '@nestjs/mongoose';
import { CourseManagement, CourseManagementSchema } from './schemas/schema';
import { UserModel } from '../user/module';
import { FacultyModel } from '../faculty/module';
import { FacultyService } from '../faculty/service';

export const CourseManagementModel = {
  name: CourseManagement.name,
  schema: CourseManagementSchema,
};

@Module({
  imports: [
    MongooseModule.forFeature([CourseManagementModel, UserModel, FacultyModel]),
  ],
  controllers: [CourseManagementController],
  providers: [CourseManagementService, FacultyService],
})
export class CourseManagementModule {}
