import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument } from 'mongoose';
import { TQF_STATUS } from 'src/common/enum/type.enum';

export type TQF5Document = HydratedDocument<TQF5>;

@Schema({
  timestamps: { createdAt: false, updatedAt: true },
})
export class TQF5 {
  @Prop({ required: true, enum: TQF_STATUS })
  status: TQF_STATUS;

  @Prop({ type: Object })
  part1?: Object;

  @Prop({ type: Object })
  part2?: Object;

  @Prop({ type: Object })
  part3?: Object;
}

export const TQF5Schema = SchemaFactory.createForClass(TQF5);
