import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { ApiProperty } from '@nestjs/swagger';
import mongoose, { HydratedDocument } from 'mongoose';
import {
  COURSE_TYPE,
  EVALUATE_TYPE,
  TEACHING_METHOD,
  TQF_STATUS,
} from 'src/common/enum/type.enum';
import {
  exampleTqf3P1,
  exampleTqf3P2,
  exampleTqf3P3,
  exampleTqf3P4,
  exampleTqf3P5,
  exampleTqf3P6,
  exampleTqf3P7,
} from 'src/common/example-response/example.response';
import { PLONo } from 'src/obe/plo/schemas/plo.schema';

@Schema()
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
  other: string;
}
export const CLOSchema = SchemaFactory.createForClass(CLO);

@Schema()
export class Eval {
  @Prop({ required: true, unique: true })
  no: number;

  @Prop({ required: true })
  topicTH: string;

  @Prop({ required: true })
  topicEN: string;

  @Prop()
  desc: string;

  @Prop({ required: true })
  percent: number;
}
export const EvalSchema = SchemaFactory.createForClass(Eval);

export type Part1TQF3 = Part1;
@Schema({
  timestamps: { createdAt: false, updatedAt: true },
})
class Part1 {
  @Prop()
  curriculum: string;

  @Prop({ type: [String], enum: COURSE_TYPE })
  courseType: COURSE_TYPE[];

  @Prop({ type: [Number] })
  studentYear: number[];

  @Prop()
  mainInstructor: string;

  @Prop({ type: [String] })
  instructors: string[];

  @Prop({ type: { in: String, out: String }, _id: false })
  teachingLocation: { in?: string; out?: string };

  @Prop()
  consultHoursWk: number;
}
const Part1Schema = SchemaFactory.createForClass(Part1);

export type Part2TQF3 = Part2;
@Schema({
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
const Part2Schema = SchemaFactory.createForClass(Part2);

export type Part3TQF3 = Part3;
@Schema({
  timestamps: { createdAt: false, updatedAt: true },
})
class Part3 {
  @Prop()
  gradingPolicy: string;

  @Prop({ type: [{ type: EvalSchema, ref: 'Eval' }] })
  eval: Eval[];
}
const Part3Schema = SchemaFactory.createForClass(Part3);

export type Part4TQF3 = Part4;
@Schema({
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
            evalWeek: { type: [String] },
            percent: { type: Number },
          },
        ],
      },
    ],
    _id: false,
  })
  data: {
    clo: CLO;
    percent: number;
    evals: {
      eval: Eval;
      evalWeek: string[];
      percent: number;
    }[];
  }[];
}
const Part4Schema = SchemaFactory.createForClass(Part4);

export type Part5TQF3 = Part5;
@Schema({
  timestamps: { createdAt: false, updatedAt: true },
})
class Part5 {
  @Prop()
  mainRef: string;

  @Prop()
  recDoc: string;
}
const Part5Schema = SchemaFactory.createForClass(Part5);

export type Part6TQF3 = Part6;
@Schema({
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
    _id: false,
  })
  data: {
    topic: string;
    detail: string[];
    other?: string;
  }[];
}
const Part6Schema = SchemaFactory.createForClass(Part6);

export type Part7TQF3 = Part7;
@Schema({
  timestamps: { createdAt: false, updatedAt: true },
})
class Part7 {
  @Prop({
    type: [
      {
        curriculum: { type: String },
        data: {
          type: [
            {
              clo: { type: mongoose.Schema.Types.ObjectId, ref: 'CLO' },
              plos: [{ type: mongoose.Schema.Types.ObjectId, ref: 'PLONo' }],
            },
          ],
          _id: false,
        },
      },
    ],
    _id: false,
  })
  list: {
    curriculum: string;
    data: {
      clo: CLO;
      plos: PLONo[];
    }[];
  }[];
}
const Part7Schema = SchemaFactory.createForClass(Part7);

export type TQF3Document = HydratedDocument<TQF3>;
@Schema({
  timestamps: { createdAt: false, updatedAt: true },
})
export class TQF3 {
  @ApiProperty({
    description: 'TQF3 document status',
    enum: TQF_STATUS,
    example: TQF_STATUS.DONE,
  })
  @Prop({ required: true, enum: TQF_STATUS })
  status: TQF_STATUS;

  @ApiProperty({
    description: 'Part 1 details',
    type: Object,
    required: false,
    example: exampleTqf3P1,
  })
  @Prop({ type: Part1Schema, _id: false })
  part1?: Part1;

  @ApiProperty({
    description: 'Part 2 details',
    type: Object,
    required: false,
    example: exampleTqf3P2,
  })
  @Prop({ type: Part2Schema, _id: false })
  part2?: Part2;

  @ApiProperty({
    description: 'Part 3 details',
    type: Object,
    required: false,
    example: exampleTqf3P3,
  })
  @Prop({ type: Part3Schema, _id: false })
  part3?: Part3;

  @ApiProperty({
    description: 'Part 4 details',
    type: Object,
    required: false,
    example: exampleTqf3P4,
  })
  @Prop({ type: Part4Schema, _id: false })
  part4?: Part4;

  @ApiProperty({
    description: 'Part 5 details',
    type: Object,
    required: false,
    example: exampleTqf3P5,
  })
  @Prop({ type: Part5Schema, _id: false })
  part5?: Part5;

  @ApiProperty({
    description: 'Part 6 details',
    type: Object,
    required: false,
    example: exampleTqf3P6,
  })
  @Prop({ type: Part6Schema, _id: false })
  part6?: Part6;

  @ApiProperty({
    description: 'Part 7 details',
    type: Object,
    required: false,
    example: exampleTqf3P7,
  })
  @Prop({ type: Part7Schema, _id: false })
  part7?: Part7;
}

export const TQF3Schema = SchemaFactory.createForClass(TQF3);
