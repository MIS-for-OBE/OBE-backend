import { Module } from '@nestjs/common';
import { TQF5, TQF5Schema } from './schemas/tqf5.schema';
import { MongooseModule } from '@nestjs/mongoose';
import { TQF5Controller } from './tqf5.controller';
import { TQF5Service } from './tqf5.service';
import { TQF3, TQF3Schema } from '../tqf3/schemas/tqf3.schema';
import { GeneratePdfTqf5BLL } from './bll/genPdf';
import { TQF3Service } from '../tqf3/tqf3.service';
import { Course, CourseSchema } from '../course/schemas/course.schema';
import { Faculty, FacultySchema } from '../faculty/schemas/faculty.schema';
import { GeneratePdfBLL } from '../tqf3/bll/genPdf';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: TQF5.name, schema: TQF5Schema },
      { name: TQF3.name, schema: TQF3Schema },
      { name: Course.name, schema: CourseSchema },
      { name: Faculty.name, schema: FacultySchema },
    ]),
  ],
  controllers: [TQF5Controller],
  providers: [TQF5Service, TQF3Service, GeneratePdfBLL, GeneratePdfTqf5BLL],
})
export class TQF5Module {}
