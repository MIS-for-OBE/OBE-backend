import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsNumber, IsString } from 'class-validator';
import { BaseDTO } from 'src/common/dto/base.dto';
import { User } from 'src/obe/user/schemas/user.schema';

export class LoginDTO extends BaseDTO {
  @IsString()
  @IsNotEmpty()
  @ApiProperty({
    description: 'access token from CMU OAuth',
    type: String,
    example: 'kEnAAUZksDrpFfpKD8QgsSfJ74PhNPme',
  })
  code: string;

  @IsString()
  @IsNotEmpty()
  @ApiProperty({
    description: 'CMU OAuth redirect uri',
    type: String,
    example: 'http://localhost:3000/cmuOAuthCallback',
  })
  redirectUri: string;
}

export class CmuOAuthBasicInfoDTO extends BaseDTO {
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
  itaccounttype_id: string;

  @IsString()
  itaccounttype_TH: string;

  @IsString()
  itaccounttype_EN: string;
}

export class CmuOAuthStdInfoDTO extends BaseDTO {
  @IsString()
  student_id: string;

  @IsString()
  prename_id: string;

  @IsString()
  prename_TH: string;

  @IsString()
  prename_EN: string;

  @IsString()
  first_name_TH: string;

  @IsString()
  last_name_TH: string;

  @IsString()
  first_name_EN: string;

  @IsString()
  last_name_EN: string;

  @IsString()
  faculty_mis_id: string;

  @IsString()
  faculty_code: string;

  @IsString()
  faculty_name_TH: string;

  @IsString()
  faculty_name_EN: string;

  @IsNumber()
  department_id: number;

  @IsString()
  department_name_TH: string;

  @IsString()
  department_name_EN: string;

  @IsNumber()
  status_id: number;

  @IsString()
  status_name: string;

  @IsString()
  cmuitaccount: string;
}

export class CmuOAuthEmpInfoDTO extends BaseDTO {
  @IsString()
  Email: string;

  @IsString()
  PrenameTha: string;

  @IsString()
  PrenameEng: string;

  @IsString()
  NameTha: string;

  @IsString()
  MiddleNameTha: string;

  @IsString()
  SurNameTha: string;

  @IsString()
  NameEng: string;

  @IsString()
  MiddleNameEng: string;

  @IsString()
  SurNameEng: string;

  @IsString()
  WorkStatusNameTha: string;

  @IsString()
  PositionNameTha: string;

  @IsString()
  OrganizationID1: string;

  @IsString()
  OrganizationName1: string;

  @IsString()
  OrganizationID2: string;

  @IsNumber()
  OrganizationName2: number;

  @IsString()
  OrganizationID3: string;

  @IsString()
  OrganizationName3: string;

  @IsNumber()
  OrganizationID4: number;

  @IsString()
  OrganizationName4: string;
}

export class TokenDTO extends BaseDTO {
  @IsString()
  @IsNotEmpty()
  @ApiProperty({
    description: 'User Info',
    type: User,
    example: {
      id: 'qwetyopsdfyguiop',
      email: 'john_doe@cmu.ac.th',
      firstNameEN: 'JOHN',
      lastNameEN: 'DOE',
      studentId: '690610696',
      role: 'Student',
      facultyCode: '06',
    },
  })
  user: User;

  @IsString()
  @IsNotEmpty()
  @ApiProperty({
    description: 'access token',
    type: String,
    example: 'eyJhbGciOi.eyJ1c2VySWQiOjIxMCwiZ.G6Tepfkrm6n',
  })
  token: string;
}
