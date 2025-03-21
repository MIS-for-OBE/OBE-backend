import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { ApiProperty } from '@nestjs/swagger';
import { HydratedDocument } from 'mongoose';

export type AcademicYearDocument = HydratedDocument<AcademicYear>;

@Schema({ collection: 'academicYears' })
export class AcademicYear {
  @ApiProperty({
    example: 2567,
    description: 'The academic year',
  })
  @Prop({ required: true })
  year: number;

  @ApiProperty({
    example: 2,
    description: 'The semester number',
    enum: [1, 2, 3],
  })
  @Prop({ required: true })
  semester: number;

  @ApiProperty({
    example: false,
    description: 'Indicates if the academic year is currently active',
  })
  @Prop({ default: false })
  isActive: boolean;
}

export const AcademicYearSchema = SchemaFactory.createForClass(
  AcademicYear,
).index({ year: 1, semester: 1 }, { unique: true });
