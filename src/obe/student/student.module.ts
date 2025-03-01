import { Module } from '@nestjs/common';
import { StudentService } from './student.service';
import { StudentController } from './student.controller';
import { MongooseModule } from '@nestjs/mongoose';
import { Course, CourseSchema } from '../course/schemas/course.schema';
import { User, UserSchema } from '../user/schemas/user.schema';
import {
  CourseManagement,
  CourseManagementSchema,
} from '../courseManagement/schemas/courseManagement.schema';
import { PLO, PLOSchema } from '../plo/schemas/plo.schema';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: User.name, schema: UserSchema },
      { name: Course.name, schema: CourseSchema },
      { name: CourseManagement.name, schema: CourseManagementSchema },
      { name: PLO.name, schema: PLOSchema },
    ]),
  ],
  controllers: [StudentController],
  providers: [StudentService],
})
export class StudentModule {}
