import { IsNumber } from 'class-validator';
import { SearchDTO } from 'src/common/dto/search.dto';
import { Type } from 'class-transformer';

export class AcademicYearSearchDTO extends SearchDTO {
  @IsNumber()
  @Type(() => Number)
  year = 2567;

  @IsNumber()
  @Type(() => Number)
  semester = 1;
}
