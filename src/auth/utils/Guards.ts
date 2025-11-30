import { AuthGuard } from '@nestjs/passport';
import { ExecutionContext, Injectable } from '@nestjs/common';

@Injectable()
export class GoogleAuthGuard extends AuthGuard('google') {
  async canActivate(context: ExecutionContext) {
    // For OAuth flow, we don't need session login since we're using JWT
    // The user will be attached to request.user by Passport after validation
    return (await super.canActivate(context)) as boolean;
  }
}

@Injectable()
export class JwtAuthGuard extends AuthGuard('jwt') {}
