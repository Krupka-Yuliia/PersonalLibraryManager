import {
  Controller,
  Get,
  UseGuards,
  Req,
  UnauthorizedException,
  InternalServerErrorException,
} from '@nestjs/common';
import { GoogleAuthGuard, JwtAuthGuard } from './utils/Guards';
import { AuthService } from './auth.service';
import type { Request } from 'express';
import { User } from '../users/entities/user.entity';

@Controller('auth')
export class AuthController {
  constructor(private authService: AuthService) {}

  @Get('google/login')
  @UseGuards(GoogleAuthGuard)
  handleLogin() {}

  @Get('google/redirect')
  @UseGuards(GoogleAuthGuard)
  handleLoginRedirect(@Req() req: Request) {
    try {
      const user = req.user as User | undefined;

      if (!user) {
        throw new UnauthorizedException(
          'Authentication failed. User not found after OAuth callback.',
        );
      }

      if (!user.id || !user.email) {
        throw new UnauthorizedException(
          'Invalid user data received from OAuth provider.',
        );
      }

      return this.authService.login(user);
    } catch (error) {
      if (error instanceof UnauthorizedException) {
        throw error;
      }
      console.error('OAuth redirect error:', error);
      throw new InternalServerErrorException(
        `Authentication error: ${error instanceof Error ? error.message : 'Unknown error'}`,
      );
    }
  }

  @Get('profile')
  @UseGuards(JwtAuthGuard)
  getProfile(@Req() req: Request) {
    const user = req.user as User | undefined;
    if (!user) {
      throw new UnauthorizedException('User not found');
    }
    return user;
  }
}
