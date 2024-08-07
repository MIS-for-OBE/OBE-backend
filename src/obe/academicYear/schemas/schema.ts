import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument } from 'mongoose';

export type AcademicYearDocument = HydratedDocument<AcademicYear>;

@Schema({
  versionKey: false,
  toJSON: {
    transform(doc, ret) {
      ret.id = ret._id;
      delete ret._id;
    },
  },
  collection: 'academicYears',
})
export class AcademicYear {
  @Prop({ required: true })
  year: number;

  @Prop({ required: true })
  semester: number;

  @Prop({ default: false })
  isActive: boolean;
}

export const AcademicYearSchema = SchemaFactory.createForClass(
  AcademicYear,
).index({ year: 1, semester: 1 }, { unique: true });
