import { IsOptional, IsString } from 'class-validator';
import { BaseDTO } from 'src/common/dto/base.dto';

export class GeneratePdfDTO extends BaseDTO {
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
