import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import mongoose, { HydratedDocument } from 'mongoose';
import {
  COURSE_TYPE,
  EVALUATE_TYPE,
  TEACHING_METHOD,
} from 'src/common/enum/type.enum';

export type TQF3Document = HydratedDocument<TQF3>;

@Schema()
class Part1 {
  @Prop({ type: String, enum: COURSE_TYPE })
  courseType: COURSE_TYPE;

  @Prop({ type: [String], enum: TEACHING_METHOD })
  teachingMethod: TEACHING_METHOD[];

  @Prop({ type: String, enum: EVALUATE_TYPE })
  evaluate: EVALUATE_TYPE;

  @Prop({ type: Number })
  semester: number;

  @Prop({ type: Number })
  studentYear: number;

  @Prop({ type: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }] })
  instructors: mongoose.Schema.Types.ObjectId[];

  @Prop({ type: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }] })
  coInstructors: mongoose.Schema.Types.ObjectId[];

  @Prop({ type: String })
  lecPlace: string;

  @Prop({ type: String })
  labPlace: string;
}
export const Part1Schema = SchemaFactory.createForClass(Part1);

@Schema()
class Part2 {
  @Prop({ type: String })
  mainRef: string;

  @Prop({ type: String })
  recDoc: string;
}
export const Part2Schema = SchemaFactory.createForClass(Part2);

@Schema()
class Part3 {
  @Prop([{ csoNo: Number, csoDescTH: String, csoDescEN: String }])
  objectives: {
    csoNo: number;
    csoDescTH: string;
    csoDescEN: string;
  }[];

  @Prop([
    { weekNo: Number, topicDesc: String, lecHour: Number, labHour: Number },
  ])
  schedule: {
    weekNo: number;
    topicDesc: string;
    lecHour: number;
    labHour: number;
  }[];
}
export const Part3Schema = SchemaFactory.createForClass(Part3);

@Schema()
class Part4 {
  @Prop({ type: Number })
  evalNo: number;

  @Prop({ type: String })
  evalTopicTH: string;

  @Prop({ type: String })
  evalTopicEN: string;

  @Prop({ type: String })
  evalDesc: string;

  @Prop({ type: Number })
  evalPercent: number;

  @Prop({ type: String })
  gradingPolicy: string;
}
export const Part4Schema = SchemaFactory.createForClass(Part4);

@Schema()
class Part5 {
  @Prop({ type: mongoose.Schema.Types.ObjectId, ref: 'CSO' })
  cso: mongoose.Schema.Types.ObjectId;

  @Prop({ type: mongoose.Schema.Types.ObjectId, ref: 'PLO' })
  plo: mongoose.Schema.Types.ObjectId;
}
export const Part5Schema = SchemaFactory.createForClass(Part5);

@Schema()
class Part6 {
  @Prop({ type: mongoose.Schema.Types.ObjectId, ref: 'CSO' })
  cso: mongoose.Schema.Types.ObjectId;

  @Prop({ type: mongoose.Schema.Types.ObjectId, ref: 'Part4' })
  eval: mongoose.Schema.Types.ObjectId;
}
export const Part6Schema = SchemaFactory.createForClass(Part6);

@Schema({
  versionKey: false,
  toJSON: {
    transform(doc, ret) {
      ret.id = ret.id ?? ret._id;
      delete ret._id;
    },
  },
  timestamps: true,
})
export class TQF3 {
  @Prop({ type: Part1Schema })
  part1: Part1;

  @Prop({ type: Part2Schema })
  part2: Part2;

  @Prop({ type: Part3Schema })
  part3: Part3;

  @Prop({ type: [Part4Schema] })
  part4: Part4[];

  @Prop({ type: [Part5Schema] })
  part5: Part5[];

  @Prop({ type: [Part6Schema] })
  part6: Part6[];
}

export const TQF3Schema = SchemaFactory.createForClass(TQF3);
