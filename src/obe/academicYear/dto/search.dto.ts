import { IsBoolean, IsNumber } from 'class-validator';
import { SearchDTO } from 'src/common/dto/search.dto';
import { Transform, Type } from 'class-transformer';

export class AcademicYearSearchDTO extends SearchDTO {
  @IsNumber()
  @Type(() => Number)
  year = 2567;

  @IsNumber()
  @Type(() => Number)
  semester = 1;

  @IsBoolean()
  @Transform((transformFn) => {
    if (transformFn.value === 'true') return true;
    else return false;
  })
  manage = false;
}
