import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import mongoose, { HydratedDocument } from 'mongoose';
import { PLONo } from 'src/obe/plo/schemas/plo.schema';
import { TQF3 } from 'src/obe/tqf3/schemas/tqf3.schema';
import { TQF5 } from 'src/obe/tqf5/schemas/tqf5.schema';
import { User } from 'src/obe/user/schemas/user.schema';

@Schema()
export class Score {
  @Prop({
    unique: true,
    required: true,
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
  })
  student: User;

  @Prop({ required: true })
  point: number;
}
export const ScoreSchema = SchemaFactory.createForClass(Score);

@Schema()
export class Question {
  @Prop({ unique: true, required: true })
  no: number;

  @Prop()
  desc: string;

  @Prop({ required: true })
  fullScore: number;

  @Prop({ type: [ScoreSchema], _id: false, required: true })
  scores: Score[];
}
export const QuestionSchema = SchemaFactory.createForClass(Question);

@Schema()
export class Assignment {
  @Prop({ unique: true, required: true })
  name: string;

  @Prop()
  desc: string;

  @Prop({ default: false })
  isPublish: string;

  @Prop({ required: true })
  weight: number;

  @Prop({ type: [QuestionSchema], _id: false, required: true })
  questions: Question[];
}
export const AssignmentSchema = SchemaFactory.createForClass(Assignment);

export type SectionDocument = HydratedDocument<Section>;
@Schema()
export class Section {
  @Prop({ required: true })
  sectionNo: number;

  @Prop()
  addFirstTime: boolean;

  @Prop({ required: true, default: true })
  isActive: boolean;

  @Prop({ required: true, type: mongoose.Schema.Types.ObjectId, ref: 'User' })
  instructor: User;

  @Prop({ type: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }] })
  coInstructors: User[];

  @Prop({ type: [AssignmentSchema], _id: false })
  assignments: Assignment[];

  @Prop()
  topic: string;

  @Prop({ type: [{ type: mongoose.Schema.Types.ObjectId, ref: 'PLONo' }] })
  plos: PLONo[];

  @Prop({ type: mongoose.Schema.Types.ObjectId, ref: 'TQF3' })
  TQF3: TQF3;

  @Prop({ type: mongoose.Schema.Types.ObjectId, ref: 'TQF5' })
  TQF5: TQF5;
}
export const SectionSchema = SchemaFactory.createForClass(Section);

// SectionSchema.pre('findOneAndDelete', async function (next) {
//   try {
//     const section = await this.model.findOne(this.getFilter());

//     if (section) {
//       await mongoose
//         .model(Course.name)
//         .updateMany(
//           { sections: section._id },
//           { $pull: { sections: section._id } },
//         );
//     }
//     next();
//   } catch (error) {
//     next();
//   }
// });
