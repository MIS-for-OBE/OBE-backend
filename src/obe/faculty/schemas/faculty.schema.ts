import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument } from 'mongoose';

export type FacultyDocument = HydratedDocument<Faculty>;

@Schema()
export class Department {
  @Prop({ required: true })
  nameTH: string;

  @Prop({ required: true })
  nameEN: string;

  @Prop({ required: true })
  code: string;
}
@Schema()
export class Curriculum {
  @Prop({ required: true })
  nameTH: string;

  @Prop({ required: true })
  nameEN: string;

  @Prop({ required: true })
  code: string;
}

@Schema()
export class Faculty {
  @Prop({ required: true, unique: true })
  facultyCode: string;

  @Prop({ required: true })
  facultyTH: string;

  @Prop({ required: true })
  facultyEN: string;

  @Prop({ required: true })
  code: string;

  @Prop()
  department: Department[];

  @Prop()
  curriculum: Curriculum[];
}

export const FacultySchema = SchemaFactory.createForClass(Faculty);
