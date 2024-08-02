import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import mongoose, { HydratedDocument } from 'mongoose';
import { ROLE } from 'src/common/enum/role.enum';
import { Course } from 'src/obe/course/schemas/course.schema';

export type UserDocument = HydratedDocument<User>;

@Schema({
  versionKey: false,
  toJSON: {
    transform(doc, ret) {
      ret.id = ret._id;
      delete ret._id;
    },
  },
})
export class User {
  @Prop()
  studentId: string;

  @Prop({ required: true })
  firstNameTH: string;

  @Prop({ required: true })
  lastNameTH: string;

  @Prop({ required: true })
  firstNameEN: string;

  @Prop({ required: true })
  lastNameEN: string;

  @Prop({ required: true, unique: true })
  email: string;

  @Prop({ required: true })
  facultyCode: string;

  @Prop()
  departmentCode: string[];

  @Prop({ required: true, enum: ROLE })
  role: string;

  @Prop({ type: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Course' }] })
  enrollCourses: Course[];

  @Prop({ type: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Course' }] })
  ownCourses: Course[];

  @Prop({ type: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Course' }] })
  coCourses: Course[];
}

export const UserSchema = SchemaFactory.createForClass(User);
