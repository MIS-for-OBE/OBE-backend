import { IsBoolean, IsString } from 'class-validator';
import { Transform, Type } from 'class-transformer';
import { SearchDTO } from 'src/common/dto/search.dto';

export class CourseSearchDTO extends SearchDTO {
  @IsString()
  @Type(() => String)
  academicYear = '';
  
  @IsBoolean()
  @Transform((transformFn) => {
    if (transformFn.value === 'true') return true;
    else return false;
  })
  manage = false;
}
