import {
  Injectable,
  NotFoundException,
  ConflictException,
  BadRequestException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User, Role } from './entities/user.entity';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';

@Injectable()
export class UsersService {
  constructor(
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
  ) {}

  async findAll(role?: string): Promise<User[]> {
    if (role) {
      if (!Object.values(Role).includes(role as Role)) {
        throw new BadRequestException(
          `Invalid role "${role}". Must be USER or ADMIN`,
        );
      }
    }

    return this.userRepository.find({
      where: role ? { role: role as Role } : {},
    });
  }

  async findOne(id: number): Promise<User> {
    const user = await this.userRepository.findOne({ where: { id } });
    if (!user) throw new NotFoundException(`User with ID ${id} not found`);
    return user;
  }

  async create(dto: CreateUserDto): Promise<User> {
    const existing = await this.userRepository.findOne({
      where: { email: dto.email },
    });
    if (existing) throw new ConflictException('Email already exists');
    const user = this.userRepository.create(dto);
    return this.userRepository.save(user);
  }

  async update(id: number, dto: UpdateUserDto): Promise<User> {
    const user = await this.findOne(id);

    if (dto.email && dto.email !== user.email) {
      const existingUser = await this.userRepository.findOne({
        where: { email: dto.email },
      });
      if (existingUser) {
        throw new ConflictException(`Email "${dto.email}" already exists`);
      }
    }

    Object.assign(user, dto);

    return this.userRepository.save(user);
  }

  async delete(id: number): Promise<User> {
    const user = await this.findOne(id);
    return this.userRepository.remove(user);
  }

  async changeRole(id: number, role: Role): Promise<User> {
    const user = await this.findOne(id);
    user.role = role;
    return this.userRepository.save(user);
  }
}
