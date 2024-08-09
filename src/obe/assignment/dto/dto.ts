import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsNumber } from 'class-validator';
import { BaseDTO } from 'src/common/dto/base.dto';

export class AcademicYearDTO extends BaseDTO {
  @IsNumber()
  @IsNotEmpty()
  @ApiProperty({
    description: 'year of academic',
    type: Number,
    example: 2024,
  })
  year: number;

  @IsNumber()
  @IsNotEmpty()
  @ApiProperty({
    description: 'semester of academic',
    type: Number,
    example: 1,
  })
  semester: number;
}
