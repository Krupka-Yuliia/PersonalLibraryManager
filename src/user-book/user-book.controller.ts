import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  Patch,
  Delete,
  HttpCode,
  Query,
  ParseIntPipe,
  UseGuards,
  ForbiddenException,
} from '@nestjs/common';
import { CreateUserBookDto } from './dto/create-user-book.dto';
import { UpdateUserBookDto } from './dto/update-user-book.dto';
import { UpdateStatusDto } from './dto/update-status.dto';
import { UpdateProgressDto } from './dto/update-progress.dto';
import { UserBooksService } from './user-book.service';
import { JwtAuthGuard } from '../auth/utils/Guards';
import { RolesGuard } from '../auth/guards/roles.guard';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import { User, Role } from '../users/entities/user.entity';
import { Roles } from '../auth/decorators/roles.decorator';

@Controller('user-books')
@UseGuards(JwtAuthGuard, RolesGuard)
export class UserBooksController {
  constructor(private readonly userBooksService: UserBooksService) {}

  @HttpCode(201)
  @Post()
  async create(
    @Body() dto: CreateUserBookDto,
    @CurrentUser() currentUser: User,
  ) {
    if (currentUser.id !== dto.userId) {
      throw new ForbiddenException(
        'You can only create user-books for yourself',
      );
    }
    return this.userBooksService.create(dto);
  }

  @Get()
  @Roles(Role.ADMIN)
  findAll() {
    return this.userBooksService.findAll();
  }

  @Get('user/:userId')
  async getUserBooks(
    @Param('userId', ParseIntPipe) userId: number,
    @CurrentUser() currentUser: User,
    @Query('status') status?: string,
    @Query('authorId') authorId?: string,
    @Query('genreId') genreId?: string,
  ) {
    if (currentUser.id !== userId) {
      throw new ForbiddenException('You can only view your own books');
    }
    return this.userBooksService.findByUser(userId, {
      status,
      authorId: authorId ? +authorId : undefined,
      genreId: genreId ? +genreId : undefined,
    });
  }

  @Get('user/:userId/search')
  async searchBooks(
    @Param('userId', ParseIntPipe) userId: number,
    @Query('q') searchTerm: string,
    @CurrentUser() currentUser: User,
  ) {
    if (currentUser.id !== userId) {
      throw new ForbiddenException('You can only search your own books');
    }
    return this.userBooksService.searchUserBooks(userId, searchTerm);
  }

  @Get('user/:userId/stats')
  async getUserStats(
    @Param('userId', ParseIntPipe) userId: number,
    @CurrentUser() currentUser: User,
    @Query('year') year?: string,
  ) {
    if (currentUser.id !== userId) {
      throw new ForbiddenException('You can only view your own statistics');
    }
    return this.userBooksService.getUserBookStats(
      userId,
      year ? +year : undefined,
    );
  }

  @Get(':id')
  async findOne(
    @Param('id', ParseIntPipe) id: number,
    @CurrentUser() currentUser: User,
  ) {
    const userBook = await this.userBooksService.findOne(id);
    if (userBook.user.id !== currentUser.id) {
      throw new ForbiddenException('You can only view your own user-books');
    }
    return userBook;
  }

  @Patch(':id')
  async update(
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: UpdateUserBookDto,
    @CurrentUser() currentUser: User,
  ) {
    const userBook = await this.userBooksService.findOne(id);
    if (userBook.user.id !== currentUser.id) {
      throw new ForbiddenException('You can only update your own user-books');
    }
    return this.userBooksService.update(id, dto);
  }

  @Patch(':id/status')
  async updateStatus(
    @Param('id', ParseIntPipe) id: number,
    @Body() updateStatusDto: UpdateStatusDto,
    @CurrentUser() currentUser: User,
  ) {
    const userBook = await this.userBooksService.findOne(id);
    if (userBook.user.id !== currentUser.id) {
      throw new ForbiddenException('You can only update your own user-books');
    }
    return this.userBooksService.updateStatus(id, updateStatusDto.status);
  }

  @Patch(':id/progress')
  async updateProgress(
    @Param('id', ParseIntPipe) id: number,
    @Body() updateProgressDto: UpdateProgressDto,
    @CurrentUser() currentUser: User,
  ) {
    const userBook = await this.userBooksService.findOne(id);
    if (userBook.user.id !== currentUser.id) {
      throw new ForbiddenException('You can only update your own user-books');
    }
    return this.userBooksService.updateProgress(
      id,
      updateProgressDto.currentPage,
    );
  }

  @HttpCode(204)
  @Delete(':id')
  async remove(
    @Param('id', ParseIntPipe) id: number,
    @CurrentUser() currentUser: User,
  ) {
    const userBook = await this.userBooksService.findOne(id);
    if (userBook.user.id !== currentUser.id) {
      throw new ForbiddenException('You can only delete your own user-books');
    }
    return this.userBooksService.remove(id);
  }
}
