import {
  Controller,
  Get,
  Post,
  Patch,
  Delete,
  Param,
  Body,
  Query,
  HttpCode,
  UseGuards,
  Req,
  ForbiddenException,
} from '@nestjs/common';
import type { Request } from 'express';
import { UsersService } from './users.service';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { ChangeRoleDto } from './dto/change-role.dto';
import { Role } from './entities/user.entity';
import { JwtAuthGuard } from '../auth/utils/Guards';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { User } from './entities/user.entity';

@Controller('users')
@UseGuards(JwtAuthGuard, RolesGuard)
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Get()
  @Roles(Role.ADMIN)
  findAll(@Query('role') role?: Role) {
    return this.usersService.findAll(role);
  }

  @Get(':id')
  async findOne(@Param('id') id: number, @Req() req: Request) {
    const currentUser = req.user as User;
    const targetUser = await this.usersService.findOne(id);

    if (currentUser.id !== id) {
      throw new ForbiddenException('You can only view your own profile');
    }

    return targetUser;
  }

  @HttpCode(201)
  @Post()
  @Roles(Role.ADMIN)
  create(@Body() dto: CreateUserDto) {
    return this.usersService.create(dto);
  }

  @Patch(':id')
  async update(
    @Param('id') id: number,
    @Body() dto: UpdateUserDto,
    @Req() req: Request,
  ) {
    const currentUser = req.user as User;

    if (currentUser.id !== id) {
      throw new ForbiddenException('You can only update your own profile');
    }

    return this.usersService.update(id, dto);
  }

  @HttpCode(204)
  @Delete(':id')
  @Roles(Role.ADMIN)
  delete(@Param('id') id: number) {
    return this.usersService.delete(id);
  }

  @Patch(':id/role')
  @Roles(Role.ADMIN)
  changeRole(
    @Param('id') id: number,
    @Body() changeRoleDto: ChangeRoleDto,
  ) {
    return this.usersService.changeRole(id, changeRoleDto.role);
  }
}
