import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { ApiProperty } from '@nestjs/swagger';
import { HydratedDocument } from 'mongoose';

export type PLODocument = HydratedDocument<PLO>;

@Schema()
export class PLONo {
  @ApiProperty({ description: 'The PLO number', example: 1 })
  @Prop({ required: true })
  no: number;

  @ApiProperty({
    description: 'Description in Thai',
    example: 'คำอธิบายภาษาไทย',
  })
  @Prop({ required: true })
  descTH: string;

  @ApiProperty({
    description: 'Description in English',
    example: 'Description in English',
  })
  @Prop({ required: true })
  descEN: string;
}

export const PLONoSchema = SchemaFactory.createForClass(PLONo);

@Schema({ collection: 'PLOs' })
export class PLO {
  @ApiProperty({ description: 'Unique PLO name', example: 'PLO 1/67' })
  @Prop({ required: true, unique: true })
  name: string;

  @ApiProperty({ description: 'Faculty code', example: '06' })
  @Prop({ required: true })
  facultyCode: string;

  @ApiProperty({
    description: 'Curriculum codes',
    example: ['CPE-2563', 'IE-2563'],
  })
  @Prop({ required: true })
  curriculum: string[];

  @ApiProperty({ description: 'Criteria in Thai', example: 'เกณฑ์ภาษาไทย' })
  @Prop({ required: true })
  criteriaTH: string;

  @ApiProperty({
    description: 'Criteria in English',
    example: 'Criteria in English',
  })
  @Prop({ required: true })
  criteriaEN: string;

  @ApiProperty({ description: 'PLO data', type: [PLONo] })
  @Prop({ required: true, type: [PLONoSchema] })
  data: PLONo[];

  @ApiProperty({
    example: true,
    description: 'for check can edit, delete PLO',
  })
  canEdit: boolean;
}

export const PLOSchema = SchemaFactory.createForClass(PLO);
