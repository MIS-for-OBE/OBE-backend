import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument } from 'mongoose';

export type AcademicYearDocument = HydratedDocument<AcademicYear>;

@Schema({ collection: 'academicYears' })
export class AcademicYear {
  @Prop({ required: true })
  year: number;

  @Prop({ required: true })
  semester: number;

  @Prop({ default: false })
  isActive: boolean;

  // @Prop({ default: true })
  // isProcessTQF3: boolean;
}

export const AcademicYearSchema = SchemaFactory.createForClass(
  AcademicYear,
).index({ year: 1, semester: 1 }, { unique: true });
