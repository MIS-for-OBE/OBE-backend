import { IsBoolean, IsNumber, IsOptional, IsString } from 'class-validator';
import { Transform } from 'class-transformer';
import { SearchDTO } from 'src/common/dto/search.dto';

export class EnrollCourseSearchDTO extends SearchDTO {
  @IsOptional()
  @IsNumber()
  @Transform((transformFn) => {
    return parseInt(transformFn.value);
  })
  year;

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
  all = false;
}
