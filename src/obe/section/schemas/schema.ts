import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import mongoose, { HydratedDocument } from 'mongoose';
// import { Assignment } from 'src/obe/assignment/schemas/assignment.schema';
import { TQF3, TQF3Schema } from 'src/obe/tqf3/schemas/schema';
import { TQF5, TQF5Schema } from 'src/obe/tqf5/schemas/schema';
import { User } from 'src/obe/user/schemas/schema';

export type SectionDocument = HydratedDocument<Section>;

@Schema({
  versionKey: false,
  toJSON: {
    transform(doc, ret) {
      ret.id = ret.id ?? ret._id;
      delete ret._id;
    },
  },
})
export class Section {
  @Prop({ required: true })
  sectionNo: number;

  @Prop()
  addFirstTime: boolean;

  @Prop({ required: true, default: true })
  isActive: boolean;

  @Prop({
    required: true,
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
  })
  instructor: User;

  @Prop({
    type: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
  })
  coInstructors: User[];

  // @Prop({
  //   type: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Assignment' }],
  // })
  // assignments: Assignment[];

  @Prop({ type: [] })
  assignments: any[];

  @Prop()
  topic: string;

  @Prop({ type: TQF3Schema, ref: 'TQF3' })
  TQF3: TQF3;

  @Prop({ type: TQF5Schema, ref: 'TQF5' })
  TQF5: TQF5;
}

export const SectionSchema = SchemaFactory.createForClass(Section);
