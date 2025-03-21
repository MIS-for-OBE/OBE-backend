import { IsBoolean, IsNumber, IsOptional } from 'class-validator';
import { Transform } from 'class-transformer';
import { SearchDTO } from 'src/common/dto/search.dto';
import { ApiProperty } from '@nestjs/swagger';

export class EnrollCourseSearchDTO extends SearchDTO {
  @IsOptional()
  @IsNumber()
  @ApiProperty({
    description: 'The academic year of the courses to retrieve',
    example: 2567,
  })
  @Transform((transformFn) => {
    return parseInt(transformFn.value);
  })
  year;

  @IsOptional()
  @IsNumber()
  @ApiProperty({
    description: 'The semester of the courses to retrieve',
    example: 2,
  })
  @Transform((transformFn) => {
    return parseInt(transformFn.value);
  })
  semester;

  @IsBoolean()
  @ApiProperty({
    description: 'If true, retrieve all enrolled courses for the student.',
    example: false,
  })
  @Transform((transformFn) => {
    if (transformFn.value === 'true') return true;
    else return false;
  })
  all = false;
}
