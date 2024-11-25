import {
  BadRequestException,
  ForbiddenException,
  Injectable,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import axios from 'axios';
import {
  TokenDTO,
  CmuOAuthBasicInfoDTO,
  LoginDTO,
  CmuOAuthStdInfoDTO,
  CmuOAuthEmpInfoDTO,
} from './dto/dto';
import { capitalize } from 'lodash';
import { Model } from 'mongoose';
import { User } from 'src/obe/user/schemas/user.schema';
import { CMU_OAUTH_ROLE, ROLE } from 'src/common/enum/role.enum';
import { InjectModel } from '@nestjs/mongoose';
import { Faculty } from 'src/obe/faculty/schemas/faculty.schema';
import { AuthService } from 'src/auth/auth.service';

@Injectable()
export class AuthenticationService {
  constructor(
    @InjectModel(User.name) private readonly userModel: Model<User>,
    @InjectModel(Faculty.name) private readonly facultyModel: Model<Faculty>,
    private readonly authService: AuthService,
  ) {}

  private async getOAuthAccessTokenAsync(
    code: string,
    redirectUri: string,
  ): Promise<string> {
    try {
      const response = await axios.post(
        process.env.CMU_OAUTH_GET_TOKEN_URL,
        {},
        {
          params: {
            code,
            redirect_uri: redirectUri,
            client_id: process.env.CMU_OAUTH_CLIENT_ID,
            client_secret: process.env.CMU_OAUTH_CLIENT_SECRET,
            grant_type: 'authorization_code',
          },
          headers: {
            'content-type': 'application/x-www-form-urlencoded',
          },
        },
      );
      return response.data.access_token;
    } catch (err) {
      console.error('Error getting OAuth access token:', err);
      return null;
    }
  }

  private async getCMUBasicInfoAsync(
    accessToken: string,
  ): Promise<CmuOAuthBasicInfoDTO> {
    try {
      const response = await axios.get(process.env.CMU_OAUTH_GET_BASIC_INFO, {
        headers: { Authorization: 'Bearer ' + accessToken },
      });
      return response.data;
    } catch (err) {
      console.error('Error getting CMU basic info:', err);
      return null;
    }
  }

  private async getCMUStdInfoAsync(
    accessToken: string,
  ): Promise<CmuOAuthStdInfoDTO> {
    try {
      const response = await axios.get(process.env.CMU_OAUTH_GET_STD_INFO, {
        headers: { Authorization: 'Bearer ' + accessToken },
      });
      return response.data;
    } catch (err) {
      console.error('Error getting CMU student info:', err);
      return null;
    }
  }

  private async getCMUEmpInfoAsync(
    accessToken: string,
  ): Promise<CmuOAuthEmpInfoDTO> {
    try {
      const response = await axios.get(process.env.CMU_OAUTH_GET_EMP_INFO, {
        headers: { Authorization: 'Bearer ' + accessToken },
      });
      return response.data;
    } catch (err) {
      console.error('Error getting CMU employee info:', err);
      return null;
    }
  }

  async login(body: LoginDTO): Promise<TokenDTO> {
    const { code, redirectUri } = body;
    if (!code) throw new BadRequestException('Invalid authorization code');
    else if (!redirectUri)
      throw new BadRequestException('Invalid redirect uri');

    //get access token
    const accessToken = await this.getOAuthAccessTokenAsync(
      body.code,
      body.redirectUri,
    );
    if (!accessToken)
      throw new BadRequestException('Cannot get OAuth access token');

    //get basic info
    const basicInfo = await this.getCMUBasicInfoAsync(accessToken);
    if (!basicInfo) throw new BadRequestException('Cannot get CMU basic info');
    if (
      ![CMU_OAUTH_ROLE.STUDENT, CMU_OAUTH_ROLE.MIS].includes(
        basicInfo.itaccounttype_id,
      ) ||
      (basicInfo.itaccounttype_id == CMU_OAUTH_ROLE.MIS &&
        basicInfo.organization_code != '06')
    )
      throw new ForbiddenException(
        'Your CMU account does not have permission for this website',
      );

    basicInfo.firstname_EN = capitalize(basicInfo.firstname_EN);
    basicInfo.lastname_EN = capitalize(basicInfo.lastname_EN);

    let user = await this.userModel.findOne({
      $or: [
        { studentId: basicInfo.student_id },
        { email: basicInfo.cmuitaccount },
      ],
    });
    const userData: Partial<User> = {
      firstNameTH: basicInfo.firstname_TH,
      lastNameTH: basicInfo.lastname_TH,
      firstNameEN: basicInfo.firstname_EN,
      lastNameEN: basicInfo.lastname_EN,
      email: basicInfo.cmuitaccount,
      facultyCode: basicInfo.organization_code,
    };
    if (!user) {
      userData.role = this.assignRole(basicInfo);
      if (basicInfo.itaccounttype_id == CMU_OAUTH_ROLE.STUDENT) {
        await this.updateUserDepartment(userData, basicInfo, accessToken);
      }
      user = await this.userModel.create(userData);
    } else if (!user.departmentCode?.length) {
      userData.role = user.role;
      if (user.studentId) {
        await this.updateUserDepartment(userData, basicInfo, accessToken);
      }
      user = await this.userModel.findByIdAndUpdate(
        user.id,
        { ...userData },
        { new: true },
      );
    }

    //create session
    const dataRs = await this.authService.generateJWTToken(user);
    dataRs.user = user;
    return dataRs;
  }

  private assignRole(basicInfo: CmuOAuthBasicInfoDTO): ROLE {
    if (this.isSupremeAdmin(basicInfo.cmuitaccount_name))
      return ROLE.SUPREME_ADMIN;
    switch (basicInfo.itaccounttype_id) {
      case CMU_OAUTH_ROLE.STUDENT:
        return ROLE.STUDENT;
      case CMU_OAUTH_ROLE.MIS:
        return ROLE.INSTRUCTOR;
    }
  }

  private isSupremeAdmin(username: string): boolean {
    return [
      'thanaporn_chan',
      'sawit_cha',
      'worapitcha_muangyot',
      'dome.potikanond',
    ].includes(username);
  }

  private async updateUserDepartment(
    user: Partial<User>,
    basicInfo: CmuOAuthBasicInfoDTO,
    accessToken: string,
  ) {
    const stdInfo = await this.getCMUStdInfoAsync(accessToken);
    user.studentId = basicInfo.student_id;
    user.role = this.isSupremeAdmin(basicInfo.cmuitaccount_name)
      ? ROLE.SUPREME_ADMIN
      : user.role == ROLE.INSTRUCTOR
        ? ROLE.TA
        : ROLE.STUDENT;
    if (user.facultyCode == '06') {
      user.departmentCode = await this.getDepartmentCode(
        user.facultyCode,
        stdInfo.department_name_TH,
      );
    } else {
      user.departmentCode = [stdInfo.department_name_EN];
    }
  }

  private async getDepartmentCode(facultyCode: string, departmentTH: string) {
    return [
      await this.facultyModel
        .findOne({ facultyCode })
        .then(
          (result) =>
            result.department.find((dep) => dep.departmentTH == departmentTH)
              .codeEN,
        ),
    ];
  }
}
