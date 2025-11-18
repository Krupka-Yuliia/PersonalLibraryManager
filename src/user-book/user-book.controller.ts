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
} from '@nestjs/common';
import { CreateUserBookDto } from './dto/create-user-book.dto';
import { UpdateUserBookDto } from './dto/update-user-book.dto';
import { UpdateStatusDto } from './dto/update-status.dto';
import { UpdateProgressDto } from './dto/update-progress.dto';
import { UserBooksService } from './user-book.service';

@Controller('user-books')
export class UserBooksController {
  constructor(private readonly userBooksService: UserBooksService) {}

  @HttpCode(201)
  @Post()
  create(@Body() dto: CreateUserBookDto) {
    return this.userBooksService.create(dto);
  }

  @Get()
  findAll() {
    return this.userBooksService.findAll();
  }

  @Get('user/:userId')
  async getUserBooks(
    @Param('userId', ParseIntPipe) userId: number,
    @Query('status') status?: string,
    @Query('authorId') authorId?: string,
    @Query('genreId') genreId?: string,
  ) {
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
  ) {
    return this.userBooksService.searchUserBooks(userId, searchTerm);
  }

  @Get('user/:userId/stats')
  async getUserStats(
    @Param('userId', ParseIntPipe) userId: number,
    @Query('year') year?: string,
  ) {
    return this.userBooksService.getUserBookStats(
      userId,
      year ? +year : undefined,
    );
  }

  @Get(':id')
  findOne(@Param('id', ParseIntPipe) id: number) {
    return this.userBooksService.findOne(id);
  }

  @Patch(':id')
  update(
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: UpdateUserBookDto,
  ) {
    return this.userBooksService.update(id, dto);
  }

  @Patch(':id/status')
  async updateStatus(
    @Param('id', ParseIntPipe) id: number,
    @Body() updateStatusDto: UpdateStatusDto,
  ) {
    return this.userBooksService.updateStatus(id, updateStatusDto.status);
  }

  @Patch(':id/progress')
  async updateProgress(
    @Param('id', ParseIntPipe) id: number,
    @Body() updateProgressDto: UpdateProgressDto,
  ) {
    return this.userBooksService.updateProgress(
      id,
      updateProgressDto.currentPage,
    );
  }

  @HttpCode(204)
  @Delete(':id')
  remove(@Param('id', ParseIntPipe) id: number) {
    return this.userBooksService.remove(id);
  }
}
