import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import mongoose, { HydratedDocument } from 'mongoose';
import { COURSE_TYPE } from 'src/common/enum/type.enum';
import { User } from 'src/obe/user/schemas/user.schema';
import { TQF3 } from 'src/obe/tqf3/schemas/tqf3.schema';
import { TQF5 } from 'src/obe/tqf5/schemas/tqf5.schema';
import { ApiProperty } from '@nestjs/swagger';

@Schema()
export class Score {
  @ApiProperty({
    example: 'Midterm',
    description: 'The name of the assignment',
  })
  @Prop()
  assignmentName: string;

  @ApiProperty({
    type: [{ name: { type: String }, score: { type: Number } }],
    description: 'Array of questions with their respective scores',
    example: [
      { name: '1', score: 10 },
      { name: '2', score: 8 },
    ],
  })
  @Prop({ type: [{ name: String, score: Number }], _id: false })
  questions: {
    name: string;
    score: number;
  }[];
}
export const ScoreSchema = SchemaFactory.createForClass(Score);

@Schema()
export class Question {
  @ApiProperty({ example: '1', description: 'The name of the question' })
  @Prop({ required: true })
  name: string;

  @ApiProperty({
    example: 'security',
    description: 'Description of the question',
  })
  @Prop()
  desc: string;

  @ApiProperty({ example: 10, description: 'The full score for the question' })
  @Prop({ required: true, min: 0 })
  fullScore: number;
}
export const QuestionSchema = SchemaFactory.createForClass(Question);

@Schema({
  timestamps: { createdAt: true, updatedAt: false },
})
export class Assignment {
  @ApiProperty({
    example: 'Midterm',
    description: 'The name of the assignment',
  })
  @Prop({ required: true })
  name: string;

  @ApiProperty({
    example: false,
    description: 'Whether the assignment is published or not',
  })
  @Prop({ default: false })
  isPublish: boolean;

  @ApiProperty({
    type: [Question],
    description: 'Array of questions for the assignment',
  })
  @Prop({ type: [{ type: QuestionSchema }], _id: false, required: true })
  questions: Question[];
}
export const AssignmentSchema = SchemaFactory.createForClass(Assignment);

@Schema()
export class Section {
  @ApiProperty({ example: 1, description: 'Section number' })
  @Prop({ required: true })
  sectionNo: number;

  @ApiProperty({ example: 'CPE-2563', description: 'Curriculum information' })
  @Prop()
  curriculum: string;

  @ApiProperty({
    description: 'Add first time',
    required: false,
  })
  @Prop()
  addFirstTime: boolean;

  @ApiProperty({ example: true, description: 'Is section active?' })
  @Prop({ required: true, default: true })
  isActive: boolean;

  // @ApiProperty({ type: User, description: 'Instructor of the section' })
  @Prop({ required: true, type: mongoose.Schema.Types.ObjectId, ref: 'User' })
  instructor: User;

  @ApiProperty({
    type: [User],
    description: 'Co-instructors of the section',
  })
  @Prop({ type: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }] })
  coInstructors: User[];

  @ApiProperty({
    // type: [{ student: User, scores: [Score] }],
    description: 'Students of the section',
  })
  @Prop({
    type: [
      {
        student: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
        scores: { type: [{ type: ScoreSchema }], _id: false },
      },
    ],
    _id: false,
  })
  students: { student: User; scores: Score[] }[];

  @ApiProperty({
    type: [Assignment],
    description: 'Assignments for this section',
  })
  @Prop({ type: [{ type: AssignmentSchema }], _id: false })
  assignments: Assignment[];

  @ApiProperty({
    description: 'Topic for the section',
    required: false,
  })
  @Prop()
  topic: string;

  // @ApiProperty({ type: TQF3, description: 'TQF3' })
  @Prop({ type: mongoose.Schema.Types.ObjectId, ref: 'TQF3' })
  TQF3: TQF3;

  // @ApiProperty({ type: TQF5, description: 'TQF5' })
  @Prop({ type: mongoose.Schema.Types.ObjectId, ref: 'TQF5' })
  TQF5: TQF5;
}
export const SectionSchema = SchemaFactory.createForClass(Section);

export type CourseDocument = HydratedDocument<Course>;
@Schema()
export class Course {
  @ApiProperty({ example: 2567, description: 'Year of the course' })
  @Prop({ required: true })
  year: number;

  @ApiProperty({ example: 2, description: 'Semester of the course' })
  @Prop({ required: true })
  semester: number;

  @ApiProperty({ example: '261999', description: 'Course number' })
  @Prop({ required: true })
  courseNo: string;

  @ApiProperty({ example: 'Course CPE Mock', description: 'Course name' })
  @Prop({ required: true })
  courseName: string;

  @ApiProperty({
    example: 'คำอธิบายรายวิชา',
    description: 'Description in Thai',
  })
  @Prop({ required: true })
  descTH: string;

  @ApiProperty({
    example: 'Course description',
    description: 'Description in English',
  })
  @Prop({ required: true })
  descEN: string;

  @ApiProperty({
    enum: COURSE_TYPE,
    example: COURSE_TYPE.GENERAL,
    description: 'Course type',
  })
  @Prop({ required: true, enum: COURSE_TYPE })
  type: COURSE_TYPE;

  @ApiProperty({
    type: [Section],
    description: 'List of sections in the course',
  })
  @Prop({ required: true, type: [{ type: SectionSchema }] })
  sections: Section[];

  @ApiProperty({
    description: 'Add first time',
    required: false,
  })
  @Prop()
  addFirstTime: boolean;

  // @ApiProperty({ type: TQF3, description: 'TQF3' })
  @Prop({ type: mongoose.Schema.Types.ObjectId, ref: 'TQF3' })
  TQF3: TQF3;

  // @ApiProperty({ type: TQF5, description: 'TQF5' })
  @Prop({ type: mongoose.Schema.Types.ObjectId, ref: 'TQF5' })
  TQF5: TQF5;
}

export const CourseSchema = SchemaFactory.createForClass(Course).index(
  { year: 1, semester: 1, courseNo: 1 },
  { unique: true },
);
