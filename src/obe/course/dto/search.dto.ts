import {
  IsArray,
  IsBoolean,
  IsNumber,
  IsOptional,
  IsString,
} from 'class-validator';
import { Transform, Type } from 'class-transformer';
import { SearchDTO } from 'src/common/dto/search.dto';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { TQF_STATUS } from 'src/common/enum/type.enum';

export class CourseSearchDTO extends SearchDTO {
  @ApiProperty({ description: 'Year of the course', example: 2567 })
  @IsNumber()
  @Transform((transformFn) => {
    return parseInt(transformFn.value);
  })
  year: string = '';

  @ApiPropertyOptional({ description: 'Semester of the course', example: 1 })
  @IsOptional()
  @IsNumber()
  @Transform((transformFn) => {
    return parseInt(transformFn.value);
  })
  semester: string;

  @ApiProperty({ description: 'Whether the course is managed', example: true })
  @IsBoolean()
  @Transform((transformFn) => {
    if (transformFn.value === 'true') return true;
    else return false;
  })
  manage: boolean = false;

  @ApiPropertyOptional({
    description: 'Whether the course has a syllabus',
    example: false,
  })
  @IsOptional()
  @IsBoolean()
  @Transform((transformFn) => {
    if (transformFn.value === 'true') return true;
    else return false;
  })
  courseSyllabus: boolean = false;

  @ApiPropertyOptional({
    description: 'Search keyword',
    example: 'CPE',
  })
  @IsString()
  @Type(() => String)
  search: string = '';

  @ApiPropertyOptional({
    description: 'Curriculum identifiers',
    type: [String],
    example: ['CPE-2563'],
  })
  @IsArray()
  @Type(() => String)
  curriculum: string[] = [];

  @ApiPropertyOptional({
    description: 'TQF3 identifiers',
    type: [String],
    enum: TQF_STATUS,
    example: [],
  })
  @IsArray()
  @Type(() => String)
  tqf3: string[] = [];

  @ApiPropertyOptional({
    description: 'TQF5 identifiers',
    type: [String],
    enum: TQF_STATUS,
    example: [],
  })
  @IsArray()
  @Type(() => String)
  tqf5: string[] = [];

  @ApiPropertyOptional({
    description: 'Whether PLO is required',
    example: false,
  })
  @IsOptional()
  @IsBoolean()
  @Transform((transformFn) => {
    if (transformFn.value === 'true') return true;
    else return false;
  })
  ploRequire: boolean = false;

  @ApiPropertyOptional({
    description: 'Whether curriculum PLO is included',
    example: false,
  })
  @IsOptional()
  @IsBoolean()
  @Transform((transformFn) => {
    if (transformFn.value === 'true') return true;
    else return false;
  })
  curriculumPlo: boolean = false;
}
