import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import mongoose, { HydratedDocument } from 'mongoose';
import { OWNER_REF, TQF_STATUS, TQF_TYPE } from 'src/common/enum/type.enum';
import { Course } from 'src/obe/course/schemas/course.schema';
import { Section } from 'src/obe/section/schemas/section.schema';

export type TQFDocument = HydratedDocument<TQF>;

@Schema({
  versionKey: false,
  toJSON: {
    transform(doc, ret) {
      ret.id = ret._id;
      delete ret._id;
    },
  },
  timestamps: true,
  collection: 'TQF',
})
export class TQF {
  @Prop({
    type: mongoose.Schema.Types.ObjectId,
    ref: 'from',
  })
  owner: Course | Section;

  @Prop({ required: true, enum: OWNER_REF })
  from: OWNER_REF;

  @Prop({ required: true, enum: TQF_STATUS, default: TQF_STATUS.NO_DATA })
  status: TQF_STATUS;

  @Prop({ required: true, enum: TQF_TYPE })
  type: TQF_TYPE;

  @Prop({ required: true })
  semester: number;
}

export const TQFSchema = SchemaFactory.createForClass(TQF).index(
  { year: 1, semester: 1 },
  { unique: true },
);
