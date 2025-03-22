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
    description: 'The ID of tha TQF3 to be generate PDF',
    example: 'id',
  })
  tqf3: string;

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

  @IsBoolean()
  @Transform((transformFn) => {
    if (transformFn.value === 'true') return true;
    else return false;
  })
  @ApiProperty({
    description:
      'Flag to indicate whether the PDF should be displayed inline or as a downloadable attachment',
    example: false,
    default: false,
  })
  display = false;

  @IsOptional()
  @ApiProperty({
    description: 'Generate PDF Part 1 of the TQF3',
    required: false,
  })
  @IsString()
  part1?: string;

  @IsOptional()
  @ApiProperty({
    description: 'Generate PDF Part 2 of the TQF3',
    required: false,
  })
  @IsString()
  part2?: string;

  @IsOptional()
  @ApiProperty({
    description: 'Generate PDF Part 3 of the TQF3',
    required: false,
  })
  @IsString()
  part3?: string;

  @IsOptional()
  @ApiProperty({
    description: 'Generate PDF Part 4 of the TQF3',
    required: false,
  })
  @IsString()
  part4?: string;

  @IsOptional()
  @ApiProperty({
    description: 'Generate PDF Part 5 of the TQF3',
    required: false,
  })
  @IsString()
  part5?: string;

  @IsOptional()
  @ApiProperty({
    description: 'Generate PDF Part 6 of the TQF3',
    required: false,
  })
  @IsString()
  part6?: string;
}
