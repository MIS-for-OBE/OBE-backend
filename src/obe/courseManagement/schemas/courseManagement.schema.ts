import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import mongoose, { HydratedDocument } from 'mongoose';
import { COURSE_TYPE } from 'src/common/enum/type.enum';
import { PLONo } from 'src/obe/plo/schemas/plo.schema';
import { User } from 'src/obe/user/schemas/user.schema';

export type CourseManagementDocument = HydratedDocument<CourseManagement>;

@Schema()
export class SectionManagement {
  @Prop({ required: true })
  sectionNo: number;

  @Prop()
  topic: string;

  @Prop({
    type: [{ type: mongoose.Schema.Types.ObjectId, ref: 'PLONo' }],
  })
  plos: PLONo[];

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
  courseNo: String;

  @Prop({ required: true })
  courseName: String;

  @Prop({ required: true })
  updatedYear: number;

  @Prop({ required: true })
  updatedSemester: number;

  @Prop({ required: true, enum: COURSE_TYPE })
  type: COURSE_TYPE;

  // @Prop({ required: true, enum: DEPARTMENT_CODE })
  // dapartmentCode: DEPARTMENT_CODE;

  @Prop({ type: [SectionManagementSchema], default: [] })
  sections?: SectionManagement[];

  @Prop({
    type: [{ type: mongoose.Schema.Types.ObjectId, ref: 'PLONo' }],
  })
  plos: PLONo[];
}

export const CourseManagementSchema =
  SchemaFactory.createForClass(CourseManagement);
