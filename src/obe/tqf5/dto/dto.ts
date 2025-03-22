import { ApiProperty } from '@nestjs/swagger';
import { Transform } from 'class-transformer';
import { IsBoolean, IsNumber, IsOptional, IsString } from 'class-validator';
import { BaseDTO } from 'src/common/dto/base.dto';

export class GeneratePdfDTO extends BaseDTO {
  @IsString()
  @ApiProperty({
    description: 'The course number associated with the TQF3',
    example: '261999',
  })
  courseNo: string;

  @IsString()
  @ApiProperty({
    description: 'The academic year for the course',
    example: '2567',
  })
  academicYear: string;

  @IsNumber()
  @ApiProperty({
    description: 'The academic term associated with the TQF3',
    example: 2,
  })
  @Transform((transformFn) => parseInt(transformFn.value))
  academicTerm: number;

  @IsString()
  @ApiProperty({
    description: 'The ID of the TQF3',
    example: 'id',
  })
  tqf3: string;

  @IsString()
  @ApiProperty({
    description: 'The ID of the TQF5 to be generate PDF',
    example: 'id',
  })
  tqf5: string;

  @IsBoolean()
  @ApiProperty({
    description:
      'If true, the PDF will be generated as a single file. if false, multiple files (one for each part) will be generated and sent as a ZIP file.',
    example: true,
  })
  @Transform((transformFn) => {
    if (transformFn.value === 'true') return true;
    else return false;
  })
  oneFile = false;

  @IsString()
  @ApiProperty({
    description: 'The curriculum will be generated',
    example: 'CPE-2563',
  })
  curriculum: string;

  @IsOptional()
  @ApiProperty({
    description: 'Generate PDF Part 1 of the TQF3',
    required: false,
  })
  @IsString()
  part1?: string;
}
