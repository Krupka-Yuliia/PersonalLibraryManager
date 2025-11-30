import {
  Injectable,
  InternalServerErrorException,
  Logger,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { JwtService } from '@nestjs/jwt';
import { User } from '../users/entities/user.entity';

@Injectable()
export class AuthService {
  private readonly logger = new Logger(AuthService.name);

  constructor(
    @InjectRepository(User)
    private userRepository: Repository<User>,
    private jwtService: JwtService,
  ) {}

  async validateOAuthUser(details: {
    googleId: string;
    email: string;
    name: string;
  }): Promise<User> {
    try {
      let user = await this.userRepository.findOne({
        where: [{ googleId: details.googleId }, { email: details.email }],
      });

      if (!user) {
        this.logger.log(
          `Creating new user: ${details.email} (Google ID: ${details.googleId})`,
        );
        user = this.userRepository.create({
          googleId: details.googleId,
          email: details.email,
          name: details.name,
        });
        user = await this.userRepository.save(user);
        this.logger.log(`User created successfully with ID: ${user.id}`);
      } else if (!user.googleId) {
        this.logger.log(
          `Updating existing user ${user.id} with Google ID: ${details.googleId}`,
        );
        user.googleId = details.googleId;
        user = await this.userRepository.save(user);
      } else {
        this.logger.log(`User found: ${user.email} (ID: ${user.id})`);
      }

      return user;
    } catch (error) {
      this.logger.error(
        `Error validating OAuth user: ${error instanceof Error ? error.message : 'Unknown error'}`,
        error instanceof Error ? error.stack : undefined,
      );
      throw new InternalServerErrorException(
        `Failed to validate or create user: ${error instanceof Error ? error.message : 'Unknown error'}`,
      );
    }
  }

  login(user: User) {
    const payload = { email: user.email, sub: user.id, role: user.role };
    return {
      access_token: this.jwtService.sign(payload),
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        role: user.role,
      },
    };
  }

  async validateUser(userId: number): Promise<User | null> {
    return this.userRepository.findOne({ where: { id: userId } });
  }
}
