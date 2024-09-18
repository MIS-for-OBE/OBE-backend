import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import mongoose, { HydratedDocument } from 'mongoose';
import { Course } from 'src/obe/course/schemas/course.schema';
import { PLONo } from 'src/obe/plo/schemas/plo.schema';
// import { Assignment } from 'src/obe/assignment/schemas/assignment.schema';
import { TQF3 } from 'src/obe/tqf3/schemas/tqf3.schema';
import { TQF5 } from 'src/obe/tqf5/schemas/tqf5.schema';
import { User } from 'src/obe/user/schemas/user.schema';

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

  @Prop({
    type: [{ type: mongoose.Schema.Types.ObjectId, ref: 'PLONo' }],
  })
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
