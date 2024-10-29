import { Injectable } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { TokenDTO } from 'src/authentication/dto/dto';
import { UserDocument } from 'src/obe/user/schemas/user.schema';

@Injectable()
export class AuthService {
  constructor(private jwtService: JwtService) {}

  async generateJWTToken(user: UserDocument): Promise<TokenDTO> {
    const data = new TokenDTO();
    // build access token
    let payload: Partial<UserDocument> = {
      id: user.id,
      email: user.email,
      firstNameEN: user.firstNameEN,
      lastNameEN: user.lastNameEN,
      role: user.role,
      facultyCode: user.facultyCode,
      ...(user.studentId && { studentId: user.studentId }),
      termsOfService: user.termsOfService ?? false,
    };

    data.token = this.jwtService.sign(payload);
    return data;
  }
}
