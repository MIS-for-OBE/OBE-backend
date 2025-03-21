import { IsBoolean } from 'class-validator';
import { SearchDTO } from 'src/common/dto/search.dto';
import { Transform } from 'class-transformer';
import { ApiProperty } from '@nestjs/swagger';

export class AcademicYearSearchDTO extends SearchDTO {
  @IsBoolean()
  @Transform((transformFn) => {
    if (transformFn.value === 'true') return true;
    else return false;
  })
  @ApiProperty({
    description:
      'if true to get all academic years for management purposes else to get academic years since active term.',
    type: Boolean,
    example: false,
    required: false,
  })
  manage = false;
}
