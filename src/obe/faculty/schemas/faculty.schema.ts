import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument } from 'mongoose';

export type FacultyDocument = HydratedDocument<Faculty>;

@Schema({
  versionKey: false,
  toJSON: {
    transform(doc, ret) {
      ret.id = ret.id ?? ret._id;
      delete ret._id;
    },
  },
})
export class Department {
  @Prop({ required: true })
  departmentTH: string;

  @Prop({ required: true })
  departmentEN: string;

  @Prop()
  courseCode: number;

  @Prop({ required: true })
  codeEN: string;

  @Prop({ required: true })
  codeTH: string;
}

@Schema({
  versionKey: false,
  toJSON: {
    transform(doc, ret) {
      ret.id = ret.id ?? ret._id;
      delete ret._id;
    },
  },
})
export class Faculty {
  @Prop({ required: true, unique: true })
  facultyCode: string;

  @Prop({ required: true })
  facultyTH: string;

  @Prop({ required: true })
  facultyEN: string;

  @Prop({ required: true })
  courseCode: number;

  @Prop({ required: true })
  codeEN: string;

  @Prop({ required: true })
  codeTH: string;

  @Prop()
  department: Department[];
}

export const FacultySchema = SchemaFactory.createForClass(Faculty);