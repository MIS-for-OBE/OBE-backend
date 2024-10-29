import { ExtractJwt, Strategy } from 'passport-jwt';
import { PassportStrategy } from '@nestjs/passport';
import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { UserDocument } from 'src/obe/user/schemas/user.schema';

@Injectable()
export class JWTStrategy extends PassportStrategy(Strategy, 'jwt_strategy') {
  constructor(configService: ConfigService) {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKey: configService.get<string>('JWT_SECRET'),
    });
  }

  async validate(payload: UserDocument) {
    return {
      id: payload.id,
      email: payload.email,
      firstNameEN: payload.firstNameEN,
      lastNameEN: payload.lastNameEN,
      role: payload.role,
      facultyCode: payload.facultyCode,
      termsOfService: payload.termsOfService,
      session: new Date(),
    };
  }
}
