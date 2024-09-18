import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import mongoose, { HydratedDocument } from 'mongoose';
import {
  COURSE_TYPE,
  EVALUATE_TYPE,
  TEACHING_METHOD,
  TQF_STATUS,
} from 'src/common/enum/type.enum';
import { PLONo, PLONoSchema } from 'src/obe/plo/schemas/plo.schema';

@Schema({
  toJSON: {
    transform(doc, ret) {
      ret.id = ret.id ?? ret._id;
      delete ret._id;
    },
  },
})
export class CLO {
  @Prop({ required: true, unique: true })
  no: number;

  @Prop({ required: true })
  descTH: string;

  @Prop({ required: true })
  descEN: string;

  @Prop({ type: [String] })
  learningMethod: string[];

  @Prop()
  other?: string;
}
export const CLOSchema = SchemaFactory.createForClass(CLO);

@Schema({
  toJSON: {
    transform(doc, ret) {
      ret.id = ret.id ?? ret._id;
      delete ret._id;
    },
  },
})
export class Eval {
  @Prop({ required: true, unique: true })
  no: number;

  @Prop({ required: true })
  topicTH: string;

  @Prop({ required: true })
  topicEN: string;

  @Prop({ required: true })
  desc: string;

  @Prop({ required: true })
  percent: number;
}
export const EvalSchema = SchemaFactory.createForClass(Eval);

@Schema({
  toJSON: {
    transform(doc, ret) {
      ret.id = ret.id ?? ret._id;
      delete ret._id;
    },
  },
  timestamps: { createdAt: false, updatedAt: true },
})
class Part1 {
  @Prop()
  curriculum: string;

  @Prop({ type: String, enum: COURSE_TYPE })
  courseType: COURSE_TYPE;

  @Prop({ type: [Number] })
  studentYear: number[];

  @Prop()
  mainInstructor: string;

  @Prop({ type: [String] })
  instructors: string[];

  @Prop({ type: { in: String, out: String }, _id: false })
  teachingLocation: { in: string; out: string };

  @Prop()
  consultHoursWk: number;
}
export const Part1Schema = SchemaFactory.createForClass(Part1);

@Schema({
  toJSON: {
    transform(doc, ret) {
      ret.id = ret.id ?? ret._id;
      delete ret._id;
    },
  },
  timestamps: { createdAt: false, updatedAt: true },
})
class Part2 {
  @Prop({ type: [String], enum: TEACHING_METHOD })
  teachingMethod: TEACHING_METHOD[];

  @Prop({ type: String, enum: EVALUATE_TYPE })
  evaluate: EVALUATE_TYPE;

  @Prop({ type: [{ type: CLOSchema, ref: 'CLO' }] })
  clo: CLO[];

  @Prop({
    type: [{ weekNo: Number, topic: String, lecHour: Number, labHour: Number }],
  })
  schedule: {
    weekNo: number;
    topic: string;
    lecHour: number;
    labHour: number;
  }[];
}
export const Part2Schema = SchemaFactory.createForClass(Part2);

@Schema({
  toJSON: {
    transform(doc, ret) {
      ret.id = ret.id ?? ret._id;
      delete ret._id;
    },
  },
  timestamps: { createdAt: false, updatedAt: true },
})
class Part3 {
  @Prop()
  gradingPolicy: string;

  @Prop({ type: [{ type: EvalSchema, ref: 'Eval' }] })
  eval: Eval[];
}
export const Part3Schema = SchemaFactory.createForClass(Part3);

@Schema({
  toJSON: {
    transform(doc, ret) {
      ret.id = ret.id ?? ret._id;
      delete ret._id;
    },
  },
  timestamps: { createdAt: false, updatedAt: true },
})
class Part4 {
  @Prop({
    type: [
      {
        clo: { type: mongoose.Schema.Types.ObjectId, ref: 'CLO' },
        percent: { type: Number },
        evals: [
          {
            eval: { type: mongoose.Schema.Types.ObjectId, ref: 'Eval' },
            evalWeek: { type: [Number] },
            percent: { type: Number },
          },
        ],
      },
    ],
  })
  data: {
    clo: CLO;
    percent: number;
    evals: {
      eval: Eval;
      evalWeek: number[];
      percent: number;
    }[];
  }[];
}
export const Part4Schema = SchemaFactory.createForClass(Part4);

@Schema({
  toJSON: {
    transform(doc, ret) {
      ret.id = ret.id ?? ret._id;
      delete ret._id;
    },
  },
  timestamps: { createdAt: false, updatedAt: true },
})
class Part5 {
  @Prop()
  mainRef: string;

  @Prop()
  recDoc: string;
}
export const Part5Schema = SchemaFactory.createForClass(Part5);

@Schema({
  toJSON: {
    transform(doc, ret) {
      ret.id = ret.id ?? ret._id;
      delete ret._id;
    },
  },
  timestamps: { createdAt: false, updatedAt: true },
})
class Part6 {
  @Prop({
    type: [
      {
        topic: { type: String, required: true },
        detail: { type: [String], required: true },
        other: { type: String },
      },
    ],
  })
  data: {
    topic: string;
    detail: string[];
    other?: string;
  }[];
}
export const Part6Schema = SchemaFactory.createForClass(Part6);

@Schema({
  toJSON: {
    transform(doc, ret) {
      ret.id = ret.id ?? ret._id;
      delete ret._id;
    },
  },
  timestamps: { createdAt: false, updatedAt: true },
})
class Part7 {
  @Prop({
    type: [
      {
        clo: { type: mongoose.Schema.Types.ObjectId, ref: 'CLO' },
        plo: [{ type: mongoose.Schema.Types.ObjectId, ref: 'PLONo' }],
      },
    ],
  })
  data: {
    clo: CLO;
    plo: PLONo[];
  }[];
}
export const Part7Schema = SchemaFactory.createForClass(Part7);

export type TQF3Document = HydratedDocument<TQF3>;

@Schema({
  versionKey: false,
  toJSON: {
    transform(doc, ret) {
      ret.id = ret.id ?? ret._id;
      delete ret._id;
    },
  },
  timestamps: { createdAt: false, updatedAt: true },
})
export class TQF3 {
  @Prop({ required: true, enum: TQF_STATUS })
  status: TQF_STATUS;

  @Prop({ type: Part1Schema })
  part1?: Part1;

  @Prop({ type: Part2Schema })
  part2?: Part2;

  @Prop({ type: Part3Schema })
  part3?: Part3;

  @Prop({ type: Part4Schema })
  part4?: Part4;

  @Prop({ type: Part5Schema })
  part5?: Part5;

  @Prop({ type: Part6Schema })
  part6?: Part6;

  @Prop({ type: Part7Schema })
  part7?: Part7;
}

export const TQF3Schema = SchemaFactory.createForClass(TQF3);
