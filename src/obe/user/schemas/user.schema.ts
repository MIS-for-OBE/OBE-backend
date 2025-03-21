import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { ApiProperty } from '@nestjs/swagger';
import mongoose, { HydratedDocument } from 'mongoose';
import { ROLE } from 'src/common/enum/role.enum';
import { Course } from 'src/obe/course/schemas/course.schema';

@Schema()
export class EnrollCourse {
  @ApiProperty({ example: 2567, description: 'Year of enrollment' })
  @Prop({ required: true })
  year: number;

  @ApiProperty({ example: 2, description: 'Semester of enrollment' })
  @Prop({ required: true })
  semester: number;

  @ApiProperty({
    description: 'Courses enrolled in the semester',
    type: [
      {
        course: { type: String, example: 'xxxxxxxxxxxxxxxxc948' },
        section: { type: Number, example: 1 },
      },
    ],
  })
  @Prop({
    type: [
      {
        course: { type: mongoose.Schema.Types.ObjectId, ref: 'Course' },
        section: Number,
      },
    ],
    _id: false,
  })
  courses: {
    course: Course;
    section: number;
  }[];
}
export const EnrollCourseSchema = SchemaFactory.createForClass(
  EnrollCourse,
).index({ year: 1, semester: 1 }, { unique: true });

export type UserDocument = HydratedDocument<User>;
@Schema()
export class User {
  @ApiProperty({
    example: '640610xxx',
    description: 'Student ID (only for students)',
    required: false,
  })
  @Prop({ unique: true, sparse: true })
  studentId: string;

  @ApiProperty({ example: 'สมชาย', description: 'First name in Thai' })
  @Prop()
  firstNameTH: string;

  @ApiProperty({ example: 'ใจดี', description: 'Last name in Thai' })
  @Prop()
  lastNameTH: string;

  @ApiProperty({ example: 'Somchai', description: 'First name in English' })
  @Prop()
  firstNameEN: string;

  @ApiProperty({ example: 'Jaidee', description: 'Last name in English' })
  @Prop()
  lastNameEN: string;

  @ApiProperty({
    example: 'somchai_j@cmu.ac.th',
    description: 'Email cmu account',
  })
  @Prop({ unique: true, sparse: true })
  email: string;

  @ApiProperty({ example: '06', description: 'Faculty code' })
  @Prop()
  facultyCode: string;

  @ApiProperty({ enum: ROLE, example: ROLE.STUDENT, description: 'User role' })
  @Prop({ required: true, enum: ROLE })
  role: string;

  @ApiProperty({
    example: ['CPE-2563'],
    description: 'User curriculums (only for curriculum admins)',
    required: false,
  })
  @Prop()
  curriculums?: string[];

  @ApiProperty({
    example: true,
    description: 'Terms of Service agreement',
    required: false,
  })
  @Prop()
  termsOfService?: boolean;

  @ApiProperty({
    type: () => [EnrollCourse],
    description: 'Enrolled courses (only for students)',
    required: false,
  })
  @Prop({ type: [EnrollCourseSchema], _id: false })
  enrollCourses?: EnrollCourse[];
}

export const UserSchema = SchemaFactory.createForClass(User);
