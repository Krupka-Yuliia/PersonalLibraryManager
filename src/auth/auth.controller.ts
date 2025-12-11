import {
  Controller,
  Get,
  UseGuards,
  Req,
  UnauthorizedException,
  InternalServerErrorException,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
} from '@nestjs/swagger';
import { GoogleAuthGuard, JwtAuthGuard } from './utils/Guards';
import { AuthService } from './auth.service';
import { AuthResponseDto } from './dto/auth-response.dto';
import { UserResponseDto } from '../users/dto/user-response.dto';
import type { Request } from 'express';
import { User } from '../users/entities/user.entity';

@ApiTags('Authentication')
@Controller('auth')
export class AuthController {
  constructor(private authService: AuthService) {}

  @Get('google/login')
  @UseGuards(GoogleAuthGuard)
  @ApiOperation({
    summary: 'Initiate Google OAuth login',
    description:
      "Start the Google OAuth authentication flow. This endpoint redirects the user to Google's login page. After successful authentication, Google will redirect back to /auth/google/redirect.",
  })
  @ApiResponse({
    status: 302,
    description: 'Redirects to Google OAuth consent screen',
  })
  handleLogin() {}

  @Get('google/redirect')
  @UseGuards(GoogleAuthGuard)
  @ApiOperation({
    summary: 'Google OAuth callback endpoint',
    description:
      'Callback endpoint for Google OAuth. This is called automatically by Google after user authentication. Returns a JWT access token that should be used for subsequent API requests.',
  })
  @ApiResponse({
    status: 200,
    description: 'Authentication successful, returns JWT token',
    type: AuthResponseDto,
  })
  @ApiResponse({
    status: 401,
    description: 'Unauthorized - Authentication failed or user data invalid',
  })
  @ApiResponse({
    status: 500,
    description: 'Internal Server Error - OAuth processing error',
  })
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
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({
    summary: 'Get current user profile',
    description:
      "Retrieve the authenticated user's profile information. Requires a valid JWT token in the Authorization header.",
  })
  @ApiResponse({
    status: 200,
    description: 'Successfully retrieved user profile',
    type: UserResponseDto,
  })
  @ApiResponse({
    status: 401,
    description: 'Unauthorized - Invalid, expired, or missing JWT token',
  })
  getProfile(@Req() req: Request) {
    const user = req.user as User | undefined;
    if (!user) {
      throw new UnauthorizedException('User not found');
    }
    return user;
  }
}
