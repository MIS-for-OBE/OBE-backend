import { Transform } from 'class-transformer';
import { IsNumber, IsOptional, IsString } from 'class-validator';
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

  @IsOptional()
  @IsString()
  part7?: string;
}
