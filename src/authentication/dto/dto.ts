import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString } from 'class-validator';
import { BaseDTO } from 'src/common/dto/base.dto';
import { CMU_ENTRAID_ROLE } from 'src/common/enum/role.enum';
import { exampleInstructor } from 'src/common/example/example';
import { User } from 'src/obe/user/schemas/user.schema';

export class LoginDTO extends BaseDTO {
  @IsString()
  @IsNotEmpty()
  @ApiProperty({
    description: 'access token from CMU EntraID',
    type: String,
    example: 'kEnAAUZksDrpFfpKD8QgsSfJ74PhNPme',
  })
  code: string;

  @IsString()
  @IsNotEmpty()
  @ApiProperty({
    description: 'CMU EntraID redirect uri',
    type: String,
    example: 'http://localhost:3000/cmuEntraIDCallback',
  })
  redirectUri: string;
}

export class CmuEntraIDBasicInfoDTO extends BaseDTO {
  @IsString()
  cmuitaccount_name: string;

  @IsString()
  cmuitaccount: string;

  @IsString()
  student_id: string;

  @IsString()
  prename_id: string;

  @IsString()
  prename_TH: string;

  @IsString()
  prename_EN: string;

  @IsString()
  firstname_TH: string;

  @IsString()
  firstname_EN: string;

  @IsString()
  lastname_TH: string;

  @IsString()
  lastname_EN: string;

  @IsString()
  organization_code: string;

  @IsString()
  organization_name_TH: string;

  @IsString()
  organization_name_EN: string;

  @IsString()
  itaccounttype_id: CMU_ENTRAID_ROLE;

  @IsString()
  itaccounttype_TH: string;

  @IsString()
  itaccounttype_EN: string;
}

export class TokenDTO extends BaseDTO {
  @IsString()
  @ApiProperty({
    description: 'User Info',
    type: User,
    example: exampleInstructor(true),
  })
  user: User;

  @IsString()
  @ApiProperty({
    description: 'access token',
    type: String,
    example: 'eyJhbGciOi.eyJ1c2VySWQiOjIxMCwiZ.G6Tepfkrm6n',
  })
  token: string;
}
