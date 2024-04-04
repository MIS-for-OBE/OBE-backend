import {
  BadRequestException,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import axios from 'axios';
import { CmuOAuthBasicInfo } from 'src/types/CmuOauthBasicinfo';

@Injectable()
export class AuthService {
  constructor(private jwtService: JwtService) {}

  async getCMUBasicInfoAsync(accessToken: string) {
    try {
      const response = await axios.get(process.env.CMU_OAUTH_GET_BASIC_INFO, {
        headers: { Authorization: 'Bearer ' + accessToken },
      });
      return response.data as CmuOAuthBasicInfo;
    } catch (err) {
      return null;
    }
  }

  async getOAuthAccessTokenAsync(code: string, redirect_uri: string) {
    try {
      const response = await axios.post(
        process.env.CMU_OAUTH_GET_TOKEN_URL,
        {},
        {
          params: {
            code,
            redirect_uri,
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

  async signIn(
    code: string,
    redirect_uri: string,
  ): Promise<{ token: string; user: any }> {
    //get access token

    const response = await this.getOAuthAccessTokenAsync(code, redirect_uri);
    if (!response)
      throw new BadRequestException({
        message: 'Cannot get OAuth access token',
      });

    //get basic info
    const response2 = await this.getCMUBasicInfoAsync(response);
    if (!response2)
      throw new BadRequestException({ message: 'Cannot get cmu basic info' });

    const firstName: string =
      response2.firstname_EN.charAt(0) +
      response2.firstname_EN.slice(1).toLowerCase();
    const lastName: string =
      response2.lastname_EN.charAt(0) +
      response2.lastname_EN.slice(1).toLowerCase();

    //create session
    const user = {
      cmuAccount: response2.cmuitaccount,
      firstName,
      lastName,
      studentId: response2.student_id,
      type: response2.itaccounttype_id,
    };
    return {
      token: await this.jwtService.signAsync(user),
      user,
    };
  }
}
