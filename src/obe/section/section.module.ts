import { Module } from '@nestjs/common';
import { SectionService } from './section.service';
import { SectionController } from './section.controller';
import { MongooseModule } from '@nestjs/mongoose';
import { Course, CourseSchema } from '../course/schemas/course.schema';
import {
  CourseManagement,
  CourseManagementSchema,
} from '../courseManagement/schemas/courseManagement.schema';
import { TQF3, TQF3Schema } from '../tqf3/schemas/tqf3.schema';
import { TQF5, TQF5Schema } from '../tqf5/schemas/tqf5.schema';
import { User, UserSchema } from '../user/schemas/user.schema';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: CourseManagement.name, schema: CourseManagementSchema },
      { name: User.name, schema: UserSchema },
      { name: Course.name, schema: CourseSchema },
      { name: TQF3.name, schema: TQF3Schema },
      { name: TQF5.name, schema: TQF5Schema },
    ]),
  ],
  controllers: [SectionController],
  providers: [SectionService],
})
export class SectionModule {}
