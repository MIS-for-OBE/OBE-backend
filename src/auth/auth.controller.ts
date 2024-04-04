import {
  Body,
  Controller,
  Get,
  HttpCode,
  HttpStatus,
  Post,
  Query,
  Request,
  UnauthorizedException,
  UseGuards,
} from '@nestjs/common';
import { AuthService } from './auth.service';
import { AuthGuard } from './auth.guard';

@Controller('auth')
export class AuthController {
  constructor(private authService: AuthService) {}

  @HttpCode(HttpStatus.OK)
  @Post()
  signIn(
    @Query('code') code: string,
    @Body('redirect_uri') redirect_uri: string,
  ) {
    if (typeof code !== 'string') {
      throw new UnauthorizedException({
        message: 'Invalid authorization code',
      });
    }
    return this.authService.signIn(code, redirect_uri);
  }

  @UseGuards(AuthGuard)
  @Get()
  getInfo(@Request() req) {
    const { exp, iat, ...user } = req.user;
    if (!user.cmuAccount)
      throw new UnauthorizedException({
        message: 'Invalid token',
      });
    return user;
  }
}
