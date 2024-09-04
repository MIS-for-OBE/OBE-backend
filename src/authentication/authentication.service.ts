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
import { User, UserDocument } from 'src/obe/user/schemas/schema';
import { CMU_OAUTH_ROLE, ROLE } from 'src/common/enum/role.enum';
import { InjectModel } from '@nestjs/mongoose';
import { Faculty } from 'src/obe/faculty/schemas/schema';

@Injectable()
export class AuthenticationService {
  constructor(
    private jwtService: JwtService,
    @InjectModel(User.name) private readonly userModel: Model<User>,
    @InjectModel(Faculty.name) private readonly facultyModel: Model<Faculty>,
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
      return null;
    }
  }

  private async generateJWTToken(user: UserDocument): Promise<TokenDTO> {
    const data = new TokenDTO();
    // build access token
    let payload = {
      id: user.id,
      email: user.email,
      firstNameEN: user.firstNameEN,
      lastNameEN: user.lastNameEN,
      role: user.role,
      facultyCode: user.facultyCode,
    } as UserDocument;
    if (user.studentId) {
      payload.studentId = user.studentId;
    }

    data.token = this.jwtService.sign(payload);
    return data;
  }

  async login(body: LoginDTO): Promise<TokenDTO> {
    if (!body.code) throw new BadRequestException('Invalid authorization code');
    else if (!body.redirectUri)
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
    else if (
      // for MISEmp engineering
      basicInfo.itaccounttype_id == CMU_OAUTH_ROLE.MIS &&
      basicInfo.organization_code != '06'
    )
      throw new ForbiddenException(
        'Your CMU account was not permission for this website',
      );

    basicInfo.firstname_EN = capitalize(basicInfo.firstname_EN);
    basicInfo.lastname_EN = capitalize(basicInfo.lastname_EN);

    let user = await this.userModel.findOne({
      email: basicInfo.cmuitaccount,
    });
    const data = {
      firstNameTH: basicInfo.firstname_TH,
      lastNameTH: basicInfo.lastname_TH,
      firstNameEN: basicInfo.firstname_EN,
      lastNameEN: basicInfo.lastname_EN,
      email: basicInfo.cmuitaccount,
      facultyCode: basicInfo.organization_code,
    } as User;
    if (!user) {
      switch (basicInfo.itaccounttype_id) {
        case CMU_OAUTH_ROLE.STUDENT:
          const stdInfo = await this.getCMUStdInfoAsync(accessToken);
          data.studentId = basicInfo.student_id;
          data.role = ROLE.STUDENT;
          data.departmentCode = await this.getDepartmentCode(
            data.facultyCode,
            stdInfo.department_name_TH,
          );
          break;
        case CMU_OAUTH_ROLE.MIS:
          data.role = ROLE.INSTRUCTOR;
          break;
      }
      if (
        [
          'thanaporn_chan',
          'sawit_cha',
          'worapitcha_muangyot',
          'dome.potikanond',
        ].includes(basicInfo.cmuitaccount_name)
      ) {
        data.role = ROLE.SUPREME_ADMIN;
      }
      user = await this.userModel.create(data);
    } else if (!user.departmentCode?.length) {
      if (user.studentId) {
        const stdInfo = await this.getCMUStdInfoAsync(accessToken);
        const role = [
          'thanaporn_chan',
          'sawit_cha',
          'worapitcha_muangyot',
        ].includes(basicInfo.cmuitaccount_name)
          ? ROLE.SUPREME_ADMIN
          : ROLE.STUDENT;
        const departmentCode = await this.getDepartmentCode(
          data.facultyCode,
          stdInfo.department_name_TH,
        );
        await user.updateOne({
          ...data,
          departmentCode,
          role,
        });
      } else {
        await user.updateOne({ ...data });
      }
      user = await this.userModel.findById(user.id);
    }

    //create session
    const dataRs = await this.generateJWTToken(user);
    dataRs.user = user;
    return dataRs;
  }

  private async getDepartmentCode(facultyCode: string, departmentTH: string) {
    return [
      await this.facultyModel
        .findOne({ facultyCode })
        .then(
          (result) =>
            result.department.find((dep) => dep.departmentTH == departmentTH)
              .departmentCode,
        ),
    ];
  }
}
