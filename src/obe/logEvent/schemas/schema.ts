import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import mongoose, { HydratedDocument } from 'mongoose';
import { LOG_EVENT_TYPE } from 'src/common/enum/type.enum';
import { Course } from 'src/obe/course/schemas/schema';
import { User } from 'src/obe/user/schemas/schema';

export type LogEventDocument = HydratedDocument<LogEvent>;

@Schema({
  versionKey: false,
  toJSON: {
    transform(doc, ret) {
      ret.id = ret.id ?? ret._id;
      delete ret._id;
    },
  },
  timestamps: { createdAt: true, updatedAt: false },
  collection: 'logEvents',
})
export class LogEvent {
  @Prop({ required: true, type: mongoose.Schema.Types.ObjectId, ref: 'User' })
  user: User;

  @Prop({ required: true, enum: LOG_EVENT_TYPE })
  type: LOG_EVENT_TYPE;

  @Prop({ required: true })
  event: string;

  @Prop({ type: { type: mongoose.Schema.Types.ObjectId, ref: 'Course' } })
  course: Course;

  @Prop()
  sectionDetect: number[];
}

export const LogEventSchema = SchemaFactory.createForClass(LogEvent);
