import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { ApiProperty } from '@nestjs/swagger';
import { HydratedDocument } from 'mongoose';

export type FacultyDocument = HydratedDocument<Faculty>;

@Schema()
export class Department {
  @ApiProperty({
    example: 'ภาควิชาวิศวกรรมคอมพิวเตอร์',
    description: 'The name of the department in Thai',
  })
  @Prop({ required: true })
  nameTH: string;

  @ApiProperty({
    example: 'Department of Computer Engineering',
    description: 'The name of the department in English',
  })
  @Prop({ required: true })
  nameEN: string;

  @ApiProperty({ example: 'CPE', description: 'The department code' })
  @Prop({ required: true })
  code: string;
}
@Schema()
export class Curriculum {
  @ApiProperty({
    example: 'หลักสูตรวิศวกรรมศาสตรบัณฑิต สาขาวิชาวิศวกรรมคอมพิวเตอร์ (2563)',
    description: 'The curriculum name in Thai',
  })
  @Prop({ required: true })
  nameTH: string;

  @ApiProperty({
    example: 'Bachelor of Engineering Program in Computer Engineering (2563)',
    description: 'The curriculum name in English',
  })
  @Prop({ required: true })
  nameEN: string;

  @ApiProperty({ example: 'CPE-2563', description: 'The curriculum code' })
  @Prop({ required: true })
  code: string;
}

export class CurriculumWithDisable extends Curriculum {
  @ApiProperty({
    example: false,
    description: 'for check can edit, delete curriculum',
  })
  disable: boolean;

  @ApiProperty({
    example: false,
    description: 'for check can change plo that map with curriculum',
  })
  disableEditPlo: boolean;
}

@Schema()
export class Faculty {
  @ApiProperty({ example: '06', description: 'The faculty code' })
  @Prop({ required: true, unique: true })
  facultyCode: string;

  @ApiProperty({
    example: 'คณะวิศวกรรมศาสตร์',
    description: 'The faculty name in Thai',
  })
  @Prop({ required: true })
  facultyTH: string;

  @ApiProperty({
    example: 'Faculty of Engineering',
    description: 'The faculty name in English',
  })
  @Prop({ required: true })
  facultyEN: string;

  @ApiProperty({
    description: 'List of departments',
    type: [Department],
  })
  @Prop()
  department: Department[];

  @ApiProperty({
    description: 'List of curriculums',
    type: [CurriculumWithDisable],
  })
  @Prop()
  curriculum: Curriculum[];
}

export const FacultySchema = SchemaFactory.createForClass(Faculty);
