import {
  BadRequestException,
  ForbiddenException,
  Injectable,
} from '@nestjs/common';
import axios from 'axios';
import { TokenDTO, CmuEntraIDBasicInfoDTO, LoginDTO } from './dto/dto';
import { capitalize } from 'lodash';
import { Model } from 'mongoose';
import { User } from 'src/obe/user/schemas/user.schema';
import { CMU_ENTRAID_ROLE, ROLE } from 'src/common/enum/role.enum';
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

  private async getEntraIDAccessTokenAsync(
    code: string,
    redirectUri: string,
  ): Promise<string> {
    try {
      const response = await axios.post(
        process.env.CMU_ENTRAID_GET_TOKEN_URL,
        {
          code,
          redirect_uri: redirectUri,
          client_id: process.env.CMU_ENTRAID_CLIENT_ID,
          client_secret: process.env.CMU_ENTRAID_CLIENT_SECRET,
          scope: process.env.SCOPE,
          grant_type: 'authorization_code',
        },
        {
          headers: {
            'content-type': 'application/x-www-form-urlencoded',
          },
        },
      );
      return response.data.access_token;
    } catch (err) {
      console.error('Error getting EntraID access token:', err);
      return null;
    }
  }

  private async getCMUBasicInfoAsync(
    accessToken: string,
  ): Promise<CmuEntraIDBasicInfoDTO> {
    try {
      const response = await axios.get(process.env.CMU_ENTRAID_GET_BASIC_INFO, {
        headers: { Authorization: 'Bearer ' + accessToken },
      });
      return response.data;
    } catch (err) {
      console.error('Error getting CMU basic info:', err);
      return null;
    }
  }

  async login(body: LoginDTO): Promise<TokenDTO> {
    const { code, redirectUri } = body;
    if (!code) throw new BadRequestException('Invalid authorization code');
    else if (!redirectUri)
      throw new BadRequestException('Invalid redirect uri');

    //get access token
    const accessToken = await this.getEntraIDAccessTokenAsync(
      body.code,
      body.redirectUri,
    );
    if (!accessToken)
      throw new BadRequestException('Cannot get EntraID access token');

    //get basic info
    const basicInfo = await this.getCMUBasicInfoAsync(accessToken);
    if (!basicInfo) throw new BadRequestException('Cannot get CMU basic info');
    if (
      ![CMU_ENTRAID_ROLE.STUDENT, CMU_ENTRAID_ROLE.MIS].includes(
        basicInfo.itaccounttype_id,
      ) ||
      (basicInfo.itaccounttype_id == CMU_ENTRAID_ROLE.MIS &&
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
      if (basicInfo.itaccounttype_id == CMU_ENTRAID_ROLE.STUDENT) {
        userData.studentId = basicInfo.student_id;
      }
      user = await this.userModel.create(userData);
    } else if (!user.termsOfService) {
      userData.role = user.role;
      if (user.studentId) {
        user.studentId = basicInfo.student_id;
        user.role = user.role == ROLE.INSTRUCTOR ? ROLE.TA : ROLE.STUDENT;
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

  private assignRole(basicInfo: CmuEntraIDBasicInfoDTO): ROLE {
    switch (basicInfo.itaccounttype_id) {
      case CMU_ENTRAID_ROLE.STUDENT:
        return ROLE.STUDENT;
      case CMU_ENTRAID_ROLE.MIS:
        return ROLE.INSTRUCTOR;
    }
  }
}
