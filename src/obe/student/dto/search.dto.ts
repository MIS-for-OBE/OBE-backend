import { IsBoolean, IsNumber, IsString } from 'class-validator';
import { Transform } from 'class-transformer';
import { SearchDTO } from 'src/common/dto/search.dto';

export class EnrollCourseSearchDTO extends SearchDTO {
  @IsNumber()
  @Transform((transformFn) => {
    return parseInt(transformFn.value);
  })
  year = 2567;

  @IsNumber()
  @Transform((transformFn) => {
    return parseInt(transformFn.value);
  })
  semester = 1;
}
