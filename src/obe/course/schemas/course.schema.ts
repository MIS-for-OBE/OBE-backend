import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import mongoose, { HydratedDocument } from 'mongoose';
import { COURSE_TYPE } from 'src/common/enum/type.enum';
import { Section } from 'src/obe/section/schemas/section.schema';
import { TQF3 } from 'src/obe/tqf3/schemas/tqf3.schema';
import { TQF5 } from 'src/obe/tqf5/schemas/tqf5.schema';

export type CourseDocument = HydratedDocument<Course>;

@Schema()
export class Course {
  @Prop({ required: true })
  year: Number;

  @Prop({ required: true })
  semester: Number;

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
  { year: 1, semester: 1, courseNo: 1 },
  { unique: true },
);

// CourseSchema.pre('findOneAndDelete', async function (next) {
//   try {
//     const course = await this.model.findOne(this.getFilter());
//     if (course) {
//       await Promise.all([
//         mongoose.model(TQF3.name).findByIdAndDelete(course.TQF3),
//         mongoose.model(TQF5.name).findByIdAndDelete(course.TQF5),
//         mongoose
//           .model(Section.name)
//           .deleteMany({ _id: { $in: course.sections } }),
//       ]);
//     }
//     next();
//   } catch (error) {
//     next();
//   }
// });
