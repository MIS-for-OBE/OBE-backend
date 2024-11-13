import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import mongoose, { HydratedDocument } from 'mongoose';
import { COURSE_TYPE } from 'src/common/enum/type.enum';
import { User } from 'src/obe/user/schemas/user.schema';
import { TQF3 } from 'src/obe/tqf3/schemas/tqf3.schema';
import { TQF5 } from 'src/obe/tqf5/schemas/tqf5.schema';
import { PLONo } from 'src/obe/plo/schemas/plo.schema';

@Schema()
export class Score {
  @Prop()
  assignmentName: string;

  @Prop({ type: [{ name: String, score: Number }], _id: false })
  questions: {
    name: string;
    score: number;
  }[];
}
export const ScoreSchema = SchemaFactory.createForClass(Score);

@Schema()
export class Question {
  @Prop({ unique: true, required: true, sparse: true })
  name: string;

  @Prop()
  desc: string;

  @Prop({ required: true })
  fullScore: number;
}
export const QuestionSchema = SchemaFactory.createForClass(Question);

@Schema({
  timestamps: { createdAt: true, updatedAt: false },
})
export class Assignment {
  @Prop({ unique: true, required: true, sparse: true })
  name: string;

  @Prop({ default: false })
  isPublish: boolean;

  @Prop({ required: true, default: 1 })
  weight: number;

  @Prop({ type: [{ type: QuestionSchema }], _id: false, required: true })
  questions: Question[];
}
export const AssignmentSchema = SchemaFactory.createForClass(Assignment);

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

  @Prop({
    type: [
      {
        student: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
        scores: [{ type: ScoreSchema }],
      },
    ],
    _id: false,
  })
  students: { student: User; scores: Score[] }[];

  @Prop({ type: [{ type: AssignmentSchema }], _id: false })
  assignments: Assignment[];

  @Prop()
  topic: string;

  @Prop({ type: mongoose.Schema.Types.ObjectId, ref: 'TQF3' })
  TQF3: TQF3;

  @Prop({ type: mongoose.Schema.Types.ObjectId, ref: 'TQF5' })
  TQF5: TQF5;
}
export const SectionSchema = SchemaFactory.createForClass(Section);

export type CourseDocument = HydratedDocument<Course>;
@Schema()
export class Course {
  @Prop({ required: true })
  year: number;

  @Prop({ required: true })
  semester: number;

  @Prop({ required: true })
  courseNo: string;

  @Prop({ required: true })
  courseName: string;

  @Prop({ required: true, enum: COURSE_TYPE })
  type: COURSE_TYPE;

  @Prop({ required: true, type: [{ type: SectionSchema }] })
  sections: Section[];

  @Prop()
  addFirstTime: boolean;

  @Prop({ type: mongoose.Schema.Types.ObjectId, ref: 'TQF3' })
  TQF3: TQF3;

  @Prop({ type: mongoose.Schema.Types.ObjectId, ref: 'TQF5' })
  TQF5: TQF5;
}

export const CourseSchema = SchemaFactory.createForClass(Course).index(
  { year: 1, semester: 1, courseNo: 1 },
  { unique: true },
);
