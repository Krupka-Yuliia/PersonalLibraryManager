import { AuthGuard } from '@nestjs/passport';
import { ExecutionContext, Injectable } from '@nestjs/common';

@Injectable()
export class GoogleAuthGuard extends AuthGuard('google') {
  async canActivate(context: ExecutionContext) {
    return (await super.canActivate(context)) as boolean;
  }
}

@Injectable()
export class JwtAuthGuard extends AuthGuard('jwt') {}
