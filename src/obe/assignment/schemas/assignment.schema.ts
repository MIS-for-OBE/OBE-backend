import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import mongoose, { HydratedDocument } from 'mongoose';
import { Course } from 'src/obe/course/schemas/course.schema';
import { Section } from 'src/obe/section/schemas/section.schema';

export type AssignmentDocument = HydratedDocument<Assignment>;

@Schema()
export class Assignment {
  @Prop({
    required: true,
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Section',
  })
  section: Section;

  @Prop({ required: true })
  name: string;

  @Prop({ required: true })
  assignDesc: string;

  @Prop({ default: false })
  isPublish: string;

  @Prop({
    type: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Course' }],
  })
  courses: Course[];
}

export const AssignmentSchema = SchemaFactory.createForClass(Assignment);
