import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import mongoose, { HydratedDocument } from 'mongoose';
import { DEPARTMENT_CODE } from 'src/common/enum/department.enum';
import { COURSE_TYPE } from 'src/common/enum/type.enum';
import { User } from 'src/obe/user/schemas/user.schema';

export type CourseManagementDocument = HydratedDocument<CourseManagement>;

@Schema()
class SectionManagement {
  @Prop({ required: true })
  sectionNo: number;

  @Prop({ required: true })
  semester: number[];

  @Prop({ required: true, type: mongoose.Schema.Types.ObjectId, ref: 'User' })
  instructor: User;

  @Prop({ required: true, default: true })
  isActive: boolean;
}

const SectionManagementSchema = SchemaFactory.createForClass(SectionManagement);

@Schema({
  versionKey: false,
  toJSON: {
    transform(doc, ret) {
      ret.id = ret._id;
      delete ret._id;
    },
  },
  timestamps: { createdAt: true, updatedAt: true },
  collection: 'courseManagements',
})
export class CourseManagement {
  @Prop({ required: true, unique: true })
  courseNo: Number;

  @Prop({ required: true })
  courseName: String;

  @Prop({ required: true })
  updatedYear: number;

  @Prop({ required: true })
  updatedSemester: number;

  @Prop({ required: true, enum: COURSE_TYPE })
  type: COURSE_TYPE;

  @Prop({ required: true, enum: DEPARTMENT_CODE })
  dapartmentCode: DEPARTMENT_CODE;

  @Prop({ type: [SectionManagementSchema] })
  sections: SectionManagement[];
}

export const CourseManagementSchema = SchemaFactory.createForClass(
  CourseManagement,
).index({ courseNo: 1, 'sections.sectionNo': 1 }, { unique: true });
