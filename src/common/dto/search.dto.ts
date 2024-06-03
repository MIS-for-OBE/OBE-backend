import { IsBoolean, IsNumber, IsString } from 'class-validator';
import { Transform, Type } from 'class-transformer';

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
  orderType = '';

  @IsString()
  @Type(() => String)
  between = '';

  @IsString()
  @Type(() => String)
  betweenDate = '';

  getStartDate() {
    return this.betweenDate.split(',')[0];
  }

  getEndDate() {
    return this.betweenDate.split(',')[1];
  }
}
