import { Module } from '@nestjs/common';
import { PLOController } from './plo.controller';
import { PLOService } from './plo.service';
import { MongooseModule } from '@nestjs/mongoose';
import { PLO, PLOSchema } from './schemas/plo.schema';
import { Course, CourseSchema } from '../course/schemas/course.schema';
import {
  CourseManagement,
  CourseManagementSchema,
} from '../courseManagement/schemas/courseManagement.schema';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: PLO.name, schema: PLOSchema },
      { name: Course.name, schema: CourseSchema },
      { name: CourseManagement.name, schema: CourseManagementSchema },
    ]),
  ],
  controllers: [PLOController],
  providers: [PLOService],
})
export class PLOModule {}
