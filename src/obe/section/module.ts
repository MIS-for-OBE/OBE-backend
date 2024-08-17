import { Module } from '@nestjs/common';
import { SectionService } from './service';
import { SectionController } from './controller';
import { MongooseModule } from '@nestjs/mongoose';
import { Section, SectionSchema } from './schemas/schema';
import { Course, CourseSchema } from '../course/schemas/schema';
import {
  CourseManagement,
  CourseManagementSchema,
} from '../courseManagement/schemas/schema';

@Module({
  imports: [
    MongooseModule.forFeature([
      {
        name: Section.name,
        schema: SectionSchema,
      },
      {
        name: CourseManagement.name,
        schema: CourseManagementSchema,
      },
      { name: Course.name, schema: CourseSchema },
    ]),
  ],
  controllers: [SectionController],
  providers: [SectionService],
})
export class SectionModule {}
