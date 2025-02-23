import { Transform } from 'class-transformer';
import { IsBoolean, IsNumber, IsOptional, IsString } from 'class-validator';
import { BaseDTO } from 'src/common/dto/base.dto';

export class GeneratePdfDTO extends BaseDTO {
  @IsString()
  courseNo: string;

  @IsString()
  academicYear: string;

  @IsNumber()
  @Transform((transformFn) => parseInt(transformFn.value))
  academicTerm: number;

  @IsString()
  tqf3: string;

  @IsString()
  tqf5: string;

  @IsBoolean()
  @Transform((transformFn) => {
    if (transformFn.value === 'true') return true;
    else return false;
  })
  oneFile = false;

  @IsString()
  curriculum: string;

  @IsOptional()
  @IsString()
  part1?: string;
}
