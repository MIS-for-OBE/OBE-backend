import { Module } from '@nestjs/common';
import { CourseService } from './course.service';
import { CourseController } from './course.controller';
import { MongooseModule } from '@nestjs/mongoose';
import { Course, CourseSchema } from './schemas/course.schema';
import {
  CourseManagement,
  CourseManagementSchema,
} from '../courseManagement/schemas/courseManagement.schema';
import { Faculty, FacultySchema } from '../faculty/schemas/faculty.schema';
import { User, UserSchema } from '../user/schemas/user.schema';
import { TQF3, TQF3Schema } from '../tqf3/schemas/tqf3.schema';
import { TQF5, TQF5Schema } from '../tqf5/schemas/tqf5.schema';
import { PLO, PLOSchema } from '../plo/schemas/plo.schema';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: Course.name, schema: CourseSchema },
      { name: CourseManagement.name, schema: CourseManagementSchema },
      { name: User.name, schema: UserSchema },
      { name: Faculty.name, schema: FacultySchema },
      { name: PLO.name, schema: PLOSchema },
      { name: TQF3.name, schema: TQF3Schema },
      { name: TQF5.name, schema: TQF5Schema },
    ]),
  ],
  controllers: [CourseController],
  providers: [CourseService],
})
export class CourseModule {}
