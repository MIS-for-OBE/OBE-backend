import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { ApiProperty } from '@nestjs/swagger';
import mongoose, { HydratedDocument } from 'mongoose';
import {
  COURSE_TYPE,
  EVALUATE_TYPE,
  TEACHING_METHOD,
  TQF_STATUS,
} from 'src/common/enum/type.enum';
import { PLONo } from 'src/obe/plo/schemas/plo.schema';

@Schema()
export class CLO {
  @ApiProperty({ description: 'CLO number', example: 1 })
  @Prop({ required: true, unique: true })
  no: number;

  @ApiProperty({
    description: 'CLO description in Thai',
    example: 'คำอธิบายภาษาไทย',
  })
  @Prop({ required: true })
  descTH: string;

  @ApiProperty({
    description: 'CLO description in English',
    example: 'English description',
  })
  @Prop({ required: true })
  descEN: string;

  @ApiProperty({
    description: 'Learning methods',
    enum: ['บรรยาย (Lecture)', 'ปฏิบัติการ (Laboratory)', 'อื่นๆ (Other)'],
    example: ['บรรยาย (Lecture)'],
  })
  @Prop({ type: [String] })
  learningMethod: string[];

  @ApiProperty({
    description: 'Other Learning methods',
    example: 'Additional Learning methods',
  })
  @Prop()
  other: string;
}
export const CLOSchema = SchemaFactory.createForClass(CLO);

@Schema()
export class Eval {
  @ApiProperty({ description: 'Evaluation number', example: 1 })
  @Prop({ required: true, unique: true })
  no: number;

  @ApiProperty({
    description: 'Evaluation topic in Thai',
    example: 'หัวข้อการประเมิน',
  })
  @Prop({ required: true })
  topicTH: string;

  @ApiProperty({
    description: 'Evaluation topic in English',
    example: 'Evaluation topic',
  })
  @Prop({ required: true })
  topicEN: string;

  @ApiProperty({
    description: 'Description of the evaluation',
    example: 'Detailed explanation',
  })
  @Prop()
  desc: string;

  @ApiProperty({ description: 'Evaluation percentage weight', example: 30 })
  @Prop({ required: true })
  percent: number;
}
export const EvalSchema = SchemaFactory.createForClass(Eval);

export type Part1TQF3 = Part1;
@Schema({
  timestamps: { createdAt: false, updatedAt: true },
})
class Part1 {
  @ApiProperty({
    description: 'Curriculum name',
    example: 'สำหรับหลายหลักสูตร',
  })
  @Prop()
  curriculum: string;

  @ApiProperty({
    description: 'Course type',
    enum: COURSE_TYPE,
    example: [COURSE_TYPE.GENERAL],
  })
  @Prop({ type: [String], enum: COURSE_TYPE })
  courseType: COURSE_TYPE[];

  @ApiProperty({
    description: 'Teaching Student year levels',
    example: [3, 4, 5, 6],
  })
  @Prop({ type: [Number] })
  studentYear: number[];

  @ApiProperty({ description: 'Main instructor name', example: 'สมชาย ใจดี' })
  @Prop()
  mainInstructor: string;

  @ApiProperty({
    description: 'All instructors',
    example: ['สมชาย ใจดี', 'มานะ ปิติ'],
  })
  @Prop({ type: [String] })
  instructors: string[];

  @ApiProperty({
    description: 'Teaching location',
    example: { in: '413A' },
  })
  @Prop({ type: { in: String, out: String }, _id: false })
  teachingLocation: { in?: string; out?: string };

  @ApiProperty({ description: 'Consultation hours per week', example: 1 })
  @Prop()
  consultHoursWk: number;
}
const Part1Schema = SchemaFactory.createForClass(Part1);

class ScheduleItem {
  @ApiProperty({ example: 1 })
  weekNo: number;

  @ApiProperty({ example: 'Introduction' })
  topic: string;

  @ApiProperty({ example: 3 })
  lecHour: number;

  @ApiProperty({ example: 0 })
  labHour: number;
}

export type Part2TQF3 = Part2;
@Schema({
  timestamps: { createdAt: false, updatedAt: true },
})
class Part2 {
  @ApiProperty({
    description: 'Teaching Methods',
    enum: TEACHING_METHOD,
    example: [TEACHING_METHOD.LEC],
  })
  @Prop({ type: [String], enum: TEACHING_METHOD })
  teachingMethod: TEACHING_METHOD[];

  @ApiProperty({
    description: 'Evaluation Type',
    enum: EVALUATE_TYPE,
    example: EVALUATE_TYPE.A_F,
  })
  @Prop({ type: String, enum: EVALUATE_TYPE })
  evaluate: EVALUATE_TYPE;

  @ApiProperty({ type: [CLO] })
  @Prop({ type: [{ type: CLOSchema, ref: 'CLO' }] })
  clo: CLO[];

  @ApiProperty({
    description: 'Weekly schedule of the course',
    type: [ScheduleItem],
    example: [{ weekNo: 1, topic: 'content 1', lecHour: 3, labHour: 0 }],
  })
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
  @ApiProperty({
    example: 'แบบอิงเกณฑ์และอิงกลุ่ม (Criterion and Norm-Referenced Grading)',
  })
  @Prop()
  gradingPolicy: string;

  @ApiProperty({ type: [Eval] })
  @Prop({ type: [{ type: EvalSchema, ref: 'Eval' }] })
  eval: Eval[];
}
const Part3Schema = SchemaFactory.createForClass(Part3);

class EvalItem {
  @ApiProperty({ type: String, example: '67858041432717f4e5036f84' })
  eval: string;

  @ApiProperty({ type: [String], example: ['1'] })
  evalWeek: string[];

  @ApiProperty({ type: Number, example: 20 })
  percent: number;
}

class Part4DataItem {
  @ApiProperty({ type: String, example: '67857fcc432717f4e5036f73' })
  clo: string;

  @ApiProperty({ type: Number, example: 20 })
  percent: number;

  @ApiProperty({ type: [EvalItem] })
  evals: EvalItem[];
}

export type Part4TQF3 = Part4;
@Schema({
  timestamps: { createdAt: false, updatedAt: true },
})
class Part4 {
  @ApiProperty({ type: [Part4DataItem] })
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
  @ApiProperty({ example: '' })
  @Prop()
  mainRef: string;

  @ApiProperty({ example: '' })
  @Prop()
  recDoc: string;
}
const Part5Schema = SchemaFactory.createForClass(Part5);

class Part6DataItem {
  @ApiProperty({
    type: String,
    example: 'กลยุทธ์การประเมินประสิทธิผลของกระบวนวิชาโดยนักศึกษา',
  })
  topic: string;

  @ApiProperty({ type: [String], example: ['ไม่มี (None)'] })
  detail: string[];

  @ApiProperty({ type: String, example: '', required: false })
  other?: string;
}

export type Part6TQF3 = Part6;
@Schema({
  timestamps: { createdAt: false, updatedAt: true },
})
class Part6 {
  @ApiProperty({ type: [Part6DataItem] })
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

class Part7DataItem {
  @ApiProperty({ type: String, example: '67857fcc432717f4e5036f73' })
  clo: string;

  @ApiProperty({
    type: [String],
    example: ['672c4430d40f44d6b1846b4e', '672c4430d40f44d6b1846b50'],
  })
  plos: string[];
}

class Part7ListItem {
  @ApiProperty({ type: String, example: 'CPE-2563' })
  curriculum: string;

  @ApiProperty({ type: [Part7DataItem] })
  data: Part7DataItem[];
}

export type Part7TQF3 = Part7;
@Schema({
  timestamps: { createdAt: false, updatedAt: true },
})
class Part7 {
  @ApiProperty({ type: [Part7ListItem] })
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

  @ApiProperty({ description: 'Part 1 details', type: Part1, required: false })
  @Prop({ type: Part1Schema, _id: false })
  part1?: Part1;

  @ApiProperty({ description: 'Part 2 details', type: Part2, required: false })
  @Prop({ type: Part2Schema, _id: false })
  part2?: Part2;

  @ApiProperty({ description: 'Part 3 details', type: Part3, required: false })
  @Prop({ type: Part3Schema, _id: false })
  part3?: Part3;

  @ApiProperty({ description: 'Part 4 details', type: Part4, required: false })
  @Prop({ type: Part4Schema, _id: false })
  part4?: Part4;

  @ApiProperty({ description: 'Part 5 details', type: Part5, required: false })
  @Prop({ type: Part5Schema, _id: false })
  part5?: Part5;

  @ApiProperty({ description: 'Part 6 details', type: Part6, required: false })
  @Prop({ type: Part6Schema, _id: false })
  part6?: Part6;

  @ApiProperty({ description: 'Part 7 details', type: Part7, required: false })
  @Prop({ type: Part7Schema, _id: false })
  part7?: Part7;
}

export const TQF3Schema = SchemaFactory.createForClass(TQF3);
