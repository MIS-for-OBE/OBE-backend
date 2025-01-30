import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { TQF3, TQF3Schema } from './schemas/tqf3.schema';
import { TQF3Service } from './tqf3.service';
import { TQF3Controller } from './tqf3.controller';
import { GeneratePdfBLL } from './bll/genPdf';
import { Faculty, FacultySchema } from '../faculty/schemas/faculty.schema';
import { Course, CourseSchema } from '../course/schemas/course.schema';
import { TQF5, TQF5Schema } from '../tqf5/schemas/tqf5.schema';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: TQF3.name, schema: TQF3Schema },
      { name: TQF5.name, schema: TQF5Schema },
      { name: Course.name, schema: CourseSchema },
      { name: Faculty.name, schema: FacultySchema },
    ]),
  ],
  controllers: [TQF3Controller],
  providers: [TQF3Service, GeneratePdfBLL],
  exports: [TQF3Service],
})
export class TQF3Module {}
