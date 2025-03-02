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

@Schema({ collection: 'PLOs' })
export class PLO {
  @Prop({ required: true, unique: true })
  name: string;

  @Prop({ required: true })
  facultyCode: string;

  @Prop({ required: true })
  curriculum: string[];

  @Prop({ required: true })
  criteriaTH: string;

  @Prop({ required: true })
  criteriaEN: string;

  @Prop({ required: true, type: [PLONoSchema] })
  data: PLONo[];
}

export const PLOSchema = SchemaFactory.createForClass(PLO);
