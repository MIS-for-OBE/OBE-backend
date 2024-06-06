import { IsNumber, IsString } from 'class-validator';
import { SearchDTO } from 'src/common/dto/search.dto';
import { Type } from 'class-transformer';

export class CourseManagementSearchDTO extends SearchDTO {
  @IsString()
  @Type(() => String)
  department = '';
}
