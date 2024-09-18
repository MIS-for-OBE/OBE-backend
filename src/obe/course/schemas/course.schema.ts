import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import mongoose, { HydratedDocument } from 'mongoose';
import { COURSE_TYPE } from 'src/common/enum/type.enum';
import { AcademicYear } from 'src/obe/academicYear/schemas/academicYear.schema';
import { Section } from 'src/obe/section/schemas/section.schema';
import { TQF3 } from 'src/obe/tqf3/schemas/tqf3.schema';
import { TQF5 } from 'src/obe/tqf5/schemas/tqf5.schema';

export type CourseDocument = HydratedDocument<Course>;

@Schema({
  versionKey: false,
  toJSON: {
    transform(doc, ret) {
      ret.id = ret.id ?? ret._id;
      delete ret._id;
    },
  },
})
export class Course {
  @Prop({
    required: true,
    type: mongoose.Schema.Types.ObjectId,
    ref: 'AcademicYear',
  })
  academicYear: AcademicYear;

  @Prop({ required: true })
  courseNo: String;

  @Prop({ required: true })
  courseName: String;

  @Prop({ required: true, enum: COURSE_TYPE })
  type: COURSE_TYPE;

  @Prop({
    required: true,
    type: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Section' }],
  })
  sections: Section[];

  @Prop()
  addFirstTime: boolean;

  @Prop({ type: mongoose.Schema.Types.ObjectId, ref: 'TQF3' })
  TQF3: TQF3;

  @Prop({ type: mongoose.Schema.Types.ObjectId, ref: 'TQF5' })
  TQF5: TQF5;
}

export const CourseSchema = SchemaFactory.createForClass(Course).index(
  { academicYear: 1, courseNo: 1 },
  { unique: true },
);

CourseSchema.pre('findOneAndDelete', async function (next) {
  const course = await this.model.findOne(this.getFilter());
  if (course) {
    await mongoose.model('Section').deleteMany({
      _id: { $in: course.sections },
    });
  }
  next();
});