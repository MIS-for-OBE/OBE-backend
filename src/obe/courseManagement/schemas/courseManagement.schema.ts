import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import mongoose, { HydratedDocument } from 'mongoose';
import { COURSE_TYPE } from 'src/common/enum/type.enum';
import { PLO, PLONo } from 'src/obe/plo/schemas/plo.schema';
import { User } from 'src/obe/user/schemas/user.schema';

export type CourseManagementDocument = HydratedDocument<CourseManagement>;

@Schema()
export class SectionManagement {
  @Prop({ required: true })
  sectionNo: number;

  @Prop()
  curriculum: string;

  @Prop()
  topic: string;

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

  @Prop()
  semester: number[];

  @Prop({ type: mongoose.Schema.Types.ObjectId, ref: 'User' })
  instructor: User;

  @Prop({ type: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }] })
  coInstructors: User[];

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
  @Prop({ required: true, unique: true })
  courseNo: string;

  @Prop({ required: true })
  courseName: string;

  @Prop({ required: true })
  descTH: string;

  @Prop({ required: true })
  descEN: string;

  @Prop({ required: true })
  updatedYear: number;

  @Prop({ required: true })
  updatedSemester: number;

  @Prop({ required: true, enum: COURSE_TYPE })
  type: COURSE_TYPE;

  @Prop({ type: [SectionManagementSchema], default: [] })
  sections?: SectionManagement[];

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
