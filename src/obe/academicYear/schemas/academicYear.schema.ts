import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import mongoose, { HydratedDocument } from 'mongoose';
import { Course } from 'src/obe/course/schemas/course.schema';
import { User } from 'src/obe/user/schemas/user.schema';

export type AcademicYearDocument = HydratedDocument<AcademicYear>;

@Schema({
  versionKey: false,
  toJSON: {
    transform(doc, ret) {
      ret.id = ret._id;
      delete ret._id;
    },
  },
  timestamps: { createdAt: true, updatedAt: false },
  collection: 'academicYears',
})
export class AcademicYear {
  @Prop({ required: true, type: mongoose.Schema.Types.ObjectId, ref: 'User' })
  creator: User;

  @Prop({ required: true, type: mongoose.Schema.Types.ObjectId, ref: 'User' })
  modifier: User;

  @Prop({ required: true })
  year: number;

  @Prop({ required: true })
  semester: number;

  @Prop({ default: false })
  isActive: boolean;

  @Prop({ type: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Course' }] })
  courses: Course[];

  @Prop({ default: Date.now() })
  updatedAt: Date;
}

export const AcademicYearSchema = SchemaFactory.createForClass(
  AcademicYear,
).index({ year: 1, semester: 1 }, { unique: true });
