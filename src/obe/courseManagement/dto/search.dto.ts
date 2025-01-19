import { IsArray, IsBoolean, IsNumber, IsString } from 'class-validator';
import { SearchDTO } from 'src/common/dto/search.dto';
import { Transform, Type } from 'class-transformer';

export class CourseManagementSearchDTO extends SearchDTO {
  @IsBoolean()
  @Transform((transformFn) => {
    if (transformFn.value === 'true') return true;
    else return false;
  })
  isPloMapping = false;

  @IsString()
  @Type(() => String)
  search = '';

  @IsArray()
  @Type(() => String)
  curriculum: string[] = [];
}
