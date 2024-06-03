import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import mongoose, { HydratedDocument } from 'mongoose';
import { AcademicYear } from 'src/obe/academicYear/schemas/academicYear.schema';
import { Section } from 'src/obe/section/schemas/section.schema';

export type CourseDocument = HydratedDocument<Course>;

@Schema({ versionKey: false })
export class Course {
  @Prop({
    required: true,
    type: mongoose.Schema.Types.ObjectId,
    ref: 'AcademicYear',
  })
  academicYear: AcademicYear;

  @Prop({ required: true })
  courseNo: number;

  @Prop({ required: true })
  courseName: string;

  @Prop({
    required: true,
    type: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Section' }],
  })
  sections: Section[];
}

export const CourseSchema = SchemaFactory.createForClass(Course).index(
  { courseNo: 1, academicYear: 1 },
  { unique: true },
);
