import { IsBoolean, IsNumber, IsString } from 'class-validator';
import { Transform, Type } from 'class-transformer';
import { SortOrder } from 'mongoose';

export class SearchDTO {
  @IsNumber()
  @Type(() => Number)
  page = 1;

  @IsNumber()
  @Type(() => Number)
  limit = 20;

  @IsBoolean()
  @Transform((transformFn) => {
    if (transformFn.value === 'true') return true;
    else return false;
  })
  count = false;

  @IsBoolean()
  @Transform((transformFn) => {
    if (transformFn.value === 'true') return true;
    else return false;
  })
  ignorePage = false;

  @IsString()
  @Type(() => String)
  query = '';

  @IsString()
  @Type(() => String)
  orderBy = '';

  @IsString()
  @Type(() => String)
  orderType = '' as SortOrder;
}
