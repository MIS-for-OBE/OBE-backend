import { ApiProperty } from '@nestjs/swagger';
import { IsBoolean, IsNotEmpty, IsString } from 'class-validator';
import { BaseDTO } from 'src/common/dto/base.dto';

export class FacultyDTO extends BaseDTO {
  @IsString()
  @IsNotEmpty()
  facultyCode: string;
}
