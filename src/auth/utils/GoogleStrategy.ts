import { PassportStrategy } from '@nestjs/passport';
import {
  Injectable,
  UnauthorizedException,
  Logger,
  InternalServerErrorException,
} from '@nestjs/common';
import { Profile, Strategy } from 'passport-google-oauth20';
import * as dotenv from 'dotenv';
import { AuthService } from '../auth.service';

dotenv.config();

@Injectable()
export class GoogleStrategy extends PassportStrategy(Strategy, 'google') {
  private readonly logger = new Logger(GoogleStrategy.name);

  constructor(private authService: AuthService) {
    const clientID = process.env.CLIENT_ID;
    const clientSecret = process.env.CLIENT_SECRET;

    if (!clientID || !clientSecret) {
      throw new Error(
        'CLIENT_ID and CLIENT_SECRET must be set in environment variables',
      );
    }

    super({
      clientID,
      clientSecret,
      callbackURL:
        process.env.GOOGLE_CALLBACK_URL ||
        'http://localhost:3000/api/auth/google/redirect',
      scope: ['profile', 'email'],
    });
  }

  async validate(
    accessToken: string,
    refreshToken: string,
    profile: Profile,
  ) {
    try {
      this.logger.log(`Validating Google profile for user: ${profile.id}`);

      const { id, name, emails } = profile;

      if (!emails || emails.length === 0 || !emails[0]?.value) {
        this.logger.error('Email not provided by Google');
        throw new UnauthorizedException('Email not provided by Google');
      }

      if (!name) {
        this.logger.error('Name not provided by Google');
        throw new UnauthorizedException('Name not provided by Google');
      }

      const fullName =
        name.givenName && name.familyName
          ? `${name.givenName} ${name.familyName}`
          : name.givenName || name.familyName || emails[0].value.split('@')[0];

      this.logger.log(
        `Processing OAuth for: ${emails[0].value} (Name: ${fullName})`,
      );

    const user = await this.authService.validateOAuthUser({
      googleId: id,
      email: emails[0].value,
      name: fullName,
    });

    this.logger.log(`OAuth validation successful for user ID: ${user.id}`);
    // Return the full user object - Passport will attach it to request.user
    return user;
    } catch (error) {
      this.logger.error(
        `Error in Google OAuth validation: ${error instanceof Error ? error.message : 'Unknown error'}`,
        error instanceof Error ? error.stack : undefined,
      );

      if (error instanceof UnauthorizedException) {
        throw error;
      }

      throw new InternalServerErrorException(
        `OAuth validation failed: ${error instanceof Error ? error.message : 'Unknown error'}`,
      );
    }
  }
}
