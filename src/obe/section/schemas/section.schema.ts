import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import mongoose, { HydratedDocument } from 'mongoose';
// import { Assignment } from 'src/obe/assignment/schemas/assignment.schema';
import { SectionManagement } from 'src/obe/courseManagement/schemas/courseManagement.schema';
import { TQF } from 'src/obe/tqf/schemas/tqf.schema';
import { User } from 'src/obe/user/schemas/user.schema';

export type SectionDocument = HydratedDocument<Section>;

@Schema({
  versionKey: false,
  toJSON: {
    transform(doc, ret) {
      ret.id = ret._id;
      delete ret._id;
    },
  },
})
export class Section {
  @Prop({
    required: true,
    type: mongoose.Schema.Types.ObjectId,
    ref: 'SectionManagement',
  })
  sectionManage: SectionManagement;

  @Prop({ required: true })
  sectionNo: number;

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
  isProcessTQF3: boolean;

  @Prop()
  topic: string;

  @Prop({ type: mongoose.Schema.Types.ObjectId, ref: 'TQF' })
  TQF3: TQF;

  @Prop({ type: mongoose.Schema.Types.ObjectId, ref: 'TQF' })
  TQF5: TQF;
}

export const SectionSchema = SchemaFactory.createForClass(Section);
