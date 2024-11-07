import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import mongoose, { HydratedDocument } from 'mongoose';
import { ROLE } from 'src/common/enum/role.enum';
import { Course } from 'src/obe/course/schemas/course.schema';
import { Section } from 'src/obe/section/schemas/section.schema';

@Schema()
export class EnrollCourse {
  @Prop({ required: true })
  year: number;

  @Prop({ required: true })
  semester: number;

  @Prop({
    type: [
      {
        course: { type: mongoose.Schema.Types.ObjectId, ref: 'Course' },
        section: { type: mongoose.Schema.Types.ObjectId, ref: 'Section' },
      },
    ],
  })
  courses: {
    course: Course;
    section: Section;
  }[];
}
export const EnrollCourseSchema = SchemaFactory.createForClass(
  EnrollCourse,
).index({ year: 1, semester: 1 }, { unique: true });

export type UserDocument = HydratedDocument<User>;
@Schema()
export class User {
  @Prop({ unique: true, sparse: true })
  studentId: string;

  @Prop()
  firstNameTH: string;

  @Prop()
  lastNameTH: string;

  @Prop()
  firstNameEN: string;

  @Prop()
  lastNameEN: string;

  @Prop({ unique: true, sparse: true })
  email: string;

  @Prop()
  facultyCode: string;

  @Prop()
  departmentCode: string[];

  @Prop({ required: true, enum: ROLE })
  role: string;

  @Prop()
  termsOfService?: boolean;

  @Prop({ type: [EnrollCourseSchema], _id: false })
  enrollCourses?: EnrollCourse[];

  // @Prop({ type: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Course' }] })
  // ownCourses: Course[];

  // @Prop({ type: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Course' }] })
  // coCourses: Course[];
}

export const UserSchema = SchemaFactory.createForClass(User);
