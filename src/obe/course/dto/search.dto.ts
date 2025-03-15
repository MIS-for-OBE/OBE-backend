import {
  IsArray,
  IsBoolean,
  IsNumber,
  IsOptional,
  IsString,
} from 'class-validator';
import { Transform, Type } from 'class-transformer';
import { SearchDTO } from 'src/common/dto/search.dto';

export class CourseSearchDTO extends SearchDTO {
  @IsNumber()
  @Transform((transformFn) => {
    return parseInt(transformFn.value);
  })
  year = '';

  @IsOptional()
  @IsNumber()
  @Transform((transformFn) => {
    return parseInt(transformFn.value);
  })
  semester;

  @IsBoolean()
  @Transform((transformFn) => {
    if (transformFn.value === 'true') return true;
    else return false;
  })
  manage = false;

  @IsBoolean()
  @Transform((transformFn) => {
    if (transformFn.value === 'true') return true;
    else return false;
  })
  courseSyllabus = false;

  @IsString()
  @Type(() => String)
  search = '';

  @IsArray()
  @Type(() => String)
  curriculum: string[] = [];

  @IsArray()
  @Type(() => String)
  tqf3: string[] = [];

  @IsArray()
  @Type(() => String)
  tqf5: string[] = [];

  @IsBoolean()
  @Transform((transformFn) => {
    if (transformFn.value === 'true') return true;
    else return false;
  })
  ploRequire = false;

  @IsBoolean()
  @Transform((transformFn) => {
    if (transformFn.value === 'true') return true;
    else return false;
  })
  curriculumPlo = false;
}
