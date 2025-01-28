import {
  IsArray,
  IsBoolean,
  IsNumber,
  IsOptional,
  IsString,
} from 'class-validator';
import { Transform, Type } from 'class-transformer';
import { SearchDTO } from 'src/common/dto/search.dto';

export class PLOSearchDTO extends SearchDTO {
  @IsString()
  @Type(() => String)
  search = '';

  @IsBoolean()
  @Transform((transformFn) => {
    if (transformFn.value === 'true') return true;
    else return false;
  })
  manage = false;

  @IsBoolean()
  @Transform((transformFn) => {
    if (transformFn.value === 'true') return true;
    else return false;
  })
  all = false;

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
}
