import { IsArray, IsBoolean, IsNumber, IsString } from 'class-validator';
import { Transform, Type } from 'class-transformer';
import { SearchDTO } from 'src/common/dto/search.dto';

export class CourseSearchDTO extends SearchDTO {
  @IsNumber()
  @Transform((transformFn) => {
    return parseInt(transformFn.value);
  })
  year = '';

  @IsNumber()
  @Transform((transformFn) => {
    return parseInt(transformFn.value);
  })
  semester = '';

  @IsBoolean()
  @Transform((transformFn) => {
    if (transformFn.value === 'true') return true;
    else return false;
  })
  manage = false;

  @IsString()
  @Type(() => String)
  search = '';

  @IsArray()
  @Type(() => String)
  departmentCode: string[] = [];
}
