import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString } from 'class-validator';
import { BaseDTO } from 'src/common/dto/base.dto';

export class CourseManagementDTO extends BaseDTO {
  @IsString()
  @IsNotEmpty()
  @ApiProperty({
    description: 'department',
    type: String,
    example: 'CPE',
  })
  department: string;
}
