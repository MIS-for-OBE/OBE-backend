import { ApiProperty } from '@nestjs/swagger';
import { IsBoolean, IsNotEmpty, IsString } from 'class-validator';
import { BaseDTO } from 'src/common/dto/base.dto';

export class UserDTO extends BaseDTO {
  @IsString()
  @IsNotEmpty()
  @ApiProperty({
    description: 'User ID',
    type: String,
    example: 'qwertyuio565sddf',
  })
  id: string;

  @IsString()
  @IsNotEmpty()
  firstNameEN: string;

  @IsString()
  @IsNotEmpty()
  lastNameEN: string;

  @IsString()
  @IsNotEmpty()
  @ApiProperty({
    description: 'cmu account',
    type: String,
    example: 'john@cmu.ac.th',
  })
  email: string;

  @IsString()
  @IsNotEmpty()
  @ApiProperty({
    description: 'role of user',
    type: String,
    example: 'Student',
  })
  role: string;
}
