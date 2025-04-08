import { Module } from '@nestjs/common';
import { PassportModule } from '@nestjs/passport';
import { JwtModule } from '@nestjs/jwt';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { JWTStrategy } from './jwt/jwt.strategy';
import { JWTAuthGuard } from './jwt/jwt.auth.guard';
import { APP_GUARD } from '@nestjs/core';
import { AuthService } from './auth.service';

@Module({
  imports: [
    JwtModule.registerAsync({
      imports: [ConfigModule],
      useFactory: async (configService: ConfigService) => ({
        secret: configService.get<string>('JWT_SECRET'),
        signOptions: { expiresIn: '1d' },
      }),
      inject: [ConfigService],
    }),
    PassportModule,
  ],
  providers: [
    JWTStrategy,
    { provide: APP_GUARD, useClass: JWTAuthGuard },
    AuthService,
  ],
  exports: [AuthService, JwtModule],
})
export class AuthModule {}
