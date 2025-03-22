import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { ApiProperty } from '@nestjs/swagger';
import mongoose, { HydratedDocument } from 'mongoose';
import { COURSE_TYPE } from 'src/common/enum/type.enum';
import { exampleAdmin, exampleInstructor } from 'src/common/example/example';
import { PLO, PLONo } from 'src/obe/plo/schemas/plo.schema';
import { User } from 'src/obe/user/schemas/user.schema';

export type CourseManagementDocument = HydratedDocument<CourseManagement>;

@Schema()
export class SectionManagement {
  @ApiProperty({ example: 1, description: 'Section number' })
  @Prop({ required: true })
  sectionNo: number;

  @ApiProperty({ example: 'CPE-2563', description: 'Curriculum' })
  @Prop()
  curriculum: string;

  @ApiProperty({
    description: 'Topic for the section',
    required: false,
    example: null,
  })
  @Prop()
  topic: string;

  @ApiProperty({
    type: 'array',
    description: 'PLO requirements for the section',
    required: false,
    example: null,
    items: {
      type: 'object',
      properties: {
        plo: {
          example: 'xxxxxxxxxxxxxxxxbde6',
          description: 'PLO reference ID',
        },
        curriculum: {
          example: 'CPE-2563',
          description: 'Curriculum associated with the PLO',
        },
        list: {
          type: 'array',
          items: { example: ['xxxxxxxxxxxxxxxx6b4d', 'xxxxxxxxxxxxxxxx6b51'] },
          description: 'List of PLONo',
        },
      },
    },
  })
  @Prop({
    type: [
      {
        plo: { type: mongoose.Schema.Types.ObjectId, ref: 'PLO' },
        curriculum: { type: String },
        list: [
          {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'PLONo',
          },
        ],
      },
    ],
    _id: false,
  })
  ploRequire: { plo: PLO; curriculum: string; list: PLONo[] }[];

  @ApiProperty({
    example: [1, 2],
    description: 'Semesters that repeat open course',
  })
  @Prop()
  semester: number[];

  @ApiProperty({
    type: User,
    description: 'Instructor of the section',
    example: exampleAdmin,
  })
  @Prop({ type: mongoose.Schema.Types.ObjectId, ref: 'User' })
  instructor: User;

  @ApiProperty({
    type: [User],
    description: 'Co-instructors of the section',
    example: [exampleInstructor()],
  })
  @Prop({ type: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }] })
  coInstructors: User[];

  @ApiProperty({ example: true, description: 'Is section active?' })
  @Prop({ required: true, default: true })
  isActive: boolean;
}

export const SectionManagementSchema =
  SchemaFactory.createForClass(SectionManagement);

@Schema({
  timestamps: true,
  collection: 'courseManagements',
})
export class CourseManagement {
  @ApiProperty({ example: '261999', description: 'Course number' })
  @Prop({ required: true, unique: true })
  courseNo: string;

  @ApiProperty({ example: 'Course CPE Mock', description: 'Course name' })
  @Prop({ required: true })
  courseName: string;

  @ApiProperty({
    example: 'คำอธิบายรายวิชา',
    description: 'Description in Thai',
  })
  @Prop()
  descTH: string;

  @ApiProperty({
    example: 'Course description',
    description: 'Description in English',
  })
  @Prop()
  descEN: string;

  @ApiProperty({ example: 2567, description: 'Year of the last update' })
  @Prop({ required: true })
  updatedYear: number;

  @ApiProperty({ example: 2, description: 'Semester of the last update' })
  @Prop({ required: true })
  updatedSemester: number;

  @ApiProperty({
    enum: COURSE_TYPE,
    example: COURSE_TYPE.GENERAL,
    description: 'Course type',
  })
  @Prop({ required: true, enum: COURSE_TYPE })
  type: COURSE_TYPE;

  @ApiProperty({
    type: [SectionManagement],
    description: 'List of sections in the course',
  })
  @Prop({ type: [SectionManagementSchema], default: [] })
  sections?: SectionManagement[];

  @ApiProperty({
    type: 'array',
    description: 'PLO requirements for the course',
    required: false,
    items: {
      type: 'object',
      properties: {
        plo: {
          example: 'xxxxxxxxxxxxxxxxbde6',
          description: 'PLO reference ID',
        },
        curriculum: {
          example: 'CPE-2563',
          description: 'Curriculum associated with the PLO',
        },
        list: {
          type: 'array',
          items: { example: ['xxxxxxxxxxxxxxxx6b4d', 'xxxxxxxxxxxxxxxx6b51'] },
          description: 'List of PLONo',
        },
      },
    },
  })
  @Prop({
    type: [
      {
        plo: { type: mongoose.Schema.Types.ObjectId, ref: 'PLO' },
        curriculum: { type: String },
        list: [
          {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'PLONo',
          },
        ],
      },
    ],
    _id: false,
  })
  ploRequire: { plo: PLO; curriculum: string; list: PLONo[] }[];
}

export const CourseManagementSchema =
  SchemaFactory.createForClass(CourseManagement);
