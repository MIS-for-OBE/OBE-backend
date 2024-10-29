import {
  ExecutionContext,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { AuthGuard } from '@nestjs/passport';
import { IS_PUBLIC_KEY } from '../metadata/public.metadata';

@Injectable()
export class JWTAuthGuard extends AuthGuard('jwt_strategy') {
  constructor(private reflector: Reflector) {
    super();
  }

  canActivate(context: ExecutionContext) {
    // Add your custom authentication logic here
    const isPublic = this.reflector.getAllAndOverride<boolean>(IS_PUBLIC_KEY, [
      context.getHandler(),
      context.getClass(),
    ]);
    if (isPublic) {
      return true;
    }
    // for example, call super.logIn(request) to establish a session.
    return super.canActivate(context);
  }

  handleRequest(err, user, info) {
    // You can throw an exception based on either "info" or "err" arguments
    if (
      err ||
      !user ||
      !user.id ||
      !user.firstNameEN ||
      !user.lastNameEN ||
      !user.email ||
      !user.role ||
      !user.facultyCode ||
      user.termsOfService == undefined
    ) {
      throw err || new UnauthorizedException();
    }
    return user;
  }
}
