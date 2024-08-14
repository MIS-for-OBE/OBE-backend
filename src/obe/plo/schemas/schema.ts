import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument } from 'mongoose';

export type PLODocument = HydratedDocument<PLO>;

@Schema()
export class PLONo {
  @Prop({ required: true })
  no: number;

  @Prop({ required: true })
  descTH: string;

  @Prop({ required: true })
  descEN: string;
}

export const PLONoSchema = SchemaFactory.createForClass(PLONo);

@Schema({
  versionKey: false,
  toJSON: {
    transform(doc, ret) {
      ret.id = ret._id;
      delete ret._id;
    },
  },
  collection: 'PLOs',
})
export class PLO {
  @Prop({ required: true })
  year: number;

  @Prop({ required: true })
  semester: number;

  @Prop({ required: true })
  facultyCode: string;

  @Prop({ required: true })
  departmentCode: string[];

  @Prop({ required: true, type: [PLONoSchema] })
  data: PLONo[];
}

export const PLOSchema = SchemaFactory.createForClass(PLO);