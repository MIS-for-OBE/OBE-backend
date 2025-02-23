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

  @IsBoolean()
  @Transform((transformFn) => {
    if (transformFn.value === 'true') return true;
    else return false;
  })
  oneFile = false;

  @IsOptional()
  @IsString()
  part1?: string;

  @IsOptional()
  @IsString()
  part2?: string;

  @IsOptional()
  @IsString()
  part3?: string;

  @IsOptional()
  @IsString()
  part4?: string;

  @IsOptional()
  @IsString()
  part5?: string;

  @IsOptional()
  @IsString()
  part6?: string;
}
