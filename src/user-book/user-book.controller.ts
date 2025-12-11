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
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
  ApiBody,
  ApiParam,
  ApiQuery,
} from '@nestjs/swagger';
import { CreateUserBookDto } from './dto/create-user-book.dto';
import { UpdateUserBookDto } from './dto/update-user-book.dto';
import { UpdateStatusDto } from './dto/update-status.dto';
import { UpdateProgressDto } from './dto/update-progress.dto';
import { UserBookResponseDto } from './dto/user-book-response.dto';
import { UserStatsResponseDto } from './dto/user-stats-response.dto';
import { UserBooksService } from './user-book.service';
import { JwtAuthGuard } from '../auth/utils/Guards';
import { RolesGuard } from '../auth/guards/roles.guard';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import { User, Role } from '../users/entities/user.entity';
import { Roles } from '../auth/decorators/roles.decorator';

@ApiTags('User Books')
@ApiBearerAuth('JWT-auth')
@Controller('user-books')
@UseGuards(JwtAuthGuard, RolesGuard)
export class UserBooksController {
  constructor(private readonly userBooksService: UserBooksService) {}

  @HttpCode(201)
  @Post()
  @ApiOperation({
    summary: 'Add a book to user library',
    description:
      'Add a book to your personal library. You can set initial status (to-read, reading, completed), rating, and review. Users can only add books to their own library.',
  })
  @ApiBody({ type: CreateUserBookDto })
  @ApiResponse({
    status: 201,
    description: 'Book successfully added to library',
    type: UserBookResponseDto,
  })
  @ApiResponse({ status: 400, description: 'Bad Request - Invalid input data' })
  @ApiResponse({
    status: 401,
    description: 'Unauthorized - Invalid or missing JWT token',
  })
  @ApiResponse({
    status: 403,
    description: 'Forbidden - You can only add books to your own library',
  })
  @ApiResponse({
    status: 404,
    description: 'Not Found - User or Book not found',
  })
  @ApiResponse({
    status: 409,
    description: 'Conflict - Book already exists in your library',
  })
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
  @ApiOperation({
    summary: 'Get all user-books',
    description:
      'Retrieve all user-book relationships across all users. Only ADMIN role can access this endpoint.',
  })
  @ApiResponse({
    status: 200,
    description: 'Successfully retrieved all user-books',
    type: [UserBookResponseDto],
  })
  @ApiResponse({
    status: 401,
    description: 'Unauthorized - Invalid or missing JWT token',
  })
  @ApiResponse({
    status: 403,
    description: 'Forbidden - Only ADMIN users can access this endpoint',
  })
  findAll() {
    return this.userBooksService.findAll();
  }

  @Get('user/:userId')
  @ApiOperation({
    summary: 'Get user books with filters',
    description:
      "Retrieve all books in a user's library with optional filters by status, author, or genre. Users can only view their own books.",
  })
  @ApiParam({ name: 'userId', type: Number, description: 'User ID' })
  @ApiQuery({
    name: 'status',
    required: false,
    description: 'Filter by reading status (to-read, reading, completed)',
  })
  @ApiQuery({
    name: 'authorId',
    required: false,
    type: Number,
    description: 'Filter by author ID',
  })
  @ApiQuery({
    name: 'genreId',
    required: false,
    type: Number,
    description: 'Filter by genre ID',
  })
  @ApiResponse({
    status: 200,
    description: 'Successfully retrieved user books',
    type: [UserBookResponseDto],
  })
  @ApiResponse({
    status: 401,
    description: 'Unauthorized - Invalid or missing JWT token',
  })
  @ApiResponse({
    status: 403,
    description: 'Forbidden - You can only view your own books',
  })
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
  @ApiOperation({
    summary: 'Search user books',
    description:
      'Search for books in your library by book title or author name. Users can only search their own books.',
  })
  @ApiParam({ name: 'userId', type: Number, description: 'User ID' })
  @ApiQuery({
    name: 'q',
    required: true,
    description: 'Search term (book title or author name)',
  })
  @ApiResponse({
    status: 200,
    description: 'Successfully retrieved search results',
    type: [UserBookResponseDto],
  })
  @ApiResponse({
    status: 401,
    description: 'Unauthorized - Invalid or missing JWT token',
  })
  @ApiResponse({
    status: 403,
    description: 'Forbidden - You can only search your own books',
  })
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
  @ApiOperation({
    summary: 'Get user reading statistics',
    description:
      'Retrieve comprehensive reading statistics including total books, completed books, reading progress, average rating, favorite genre, and recently added books. Optionally filter by year for completed books. Users can only view their own statistics.',
  })
  @ApiParam({ name: 'userId', type: Number, description: 'User ID' })
  @ApiQuery({
    name: 'year',
    required: false,
    description: 'Filter statistics by year (for completed books)',
  })
  @ApiResponse({
    status: 200,
    description: 'Successfully retrieved reading statistics',
    type: UserStatsResponseDto,
  })
  @ApiResponse({
    status: 401,
    description: 'Unauthorized - Invalid or missing JWT token',
  })
  @ApiResponse({
    status: 403,
    description: 'Forbidden - You can only view your own statistics',
  })
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
  @ApiOperation({
    summary: 'Get user-book by ID',
    description:
      'Retrieve detailed information about a specific book in your library, including reading progress and calculated progress percentage.',
  })
  @ApiParam({ name: 'id', type: Number, description: 'User-book ID' })
  @ApiResponse({
    status: 200,
    description: 'Successfully retrieved user-book with progress',
    type: UserBookResponseDto,
  })
  @ApiResponse({
    status: 401,
    description: 'Unauthorized - Invalid or missing JWT token',
  })
  @ApiResponse({
    status: 403,
    description: 'Forbidden - You can only view your own user-books',
  })
  @ApiResponse({
    status: 404,
    description: 'Not Found - User-book with the specified ID does not exist',
  })
  async findOne(
    @Param('id', ParseIntPipe) id: number,
    @CurrentUser() currentUser: User,
  ) {
    const userBook = await this.userBooksService.findOne(id);
    if (userBook.user.id !== currentUser.id) {
      throw new ForbiddenException('You can only view your own user-books');
    }
    const progressPercentage =
      userBook.book.totalPages > 0
        ? Math.round((userBook.currentPage / userBook.book.totalPages) * 100)
        : 0;
    return {
      ...userBook,
      progressPercentage,
    };
  }

  @Patch(':id')
  @ApiOperation({
    summary: 'Update user-book',
    description:
      'Update book information in your library, such as rating or review. Supports partial updates. Users can only update their own books.',
  })
  @ApiParam({ name: 'id', type: Number, description: 'User-book ID' })
  @ApiBody({ type: UpdateUserBookDto })
  @ApiResponse({
    status: 200,
    description: 'User-book successfully updated',
    type: UserBookResponseDto,
  })
  @ApiResponse({ status: 400, description: 'Bad Request - Invalid input data' })
  @ApiResponse({
    status: 401,
    description: 'Unauthorized - Invalid or missing JWT token',
  })
  @ApiResponse({
    status: 403,
    description: 'Forbidden - You can only update your own user-books',
  })
  @ApiResponse({
    status: 404,
    description: 'Not Found - User-book with the specified ID does not exist',
  })
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
  @ApiOperation({
    summary: 'Update reading status',
    description:
      'Update the reading status of a book (to-read, reading, completed). When status is set to completed, completedAt timestamp is automatically set and reading goals are updated. Users can only update their own books.',
  })
  @ApiParam({ name: 'id', type: Number, description: 'User-book ID' })
  @ApiBody({ type: UpdateStatusDto })
  @ApiResponse({
    status: 200,
    description: 'Reading status successfully updated',
    type: UserBookResponseDto,
  })
  @ApiResponse({
    status: 400,
    description: 'Bad Request - Invalid status value',
  })
  @ApiResponse({
    status: 401,
    description: 'Unauthorized - Invalid or missing JWT token',
  })
  @ApiResponse({
    status: 403,
    description: 'Forbidden - You can only update your own user-books',
  })
  @ApiResponse({
    status: 404,
    description: 'Not Found - User-book with the specified ID does not exist',
  })
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
  @ApiOperation({
    summary: 'Update reading progress',
    description:
      'Update the current page number for a book. If progress is set and status was "to-read", status automatically changes to "reading". If current page reaches or exceeds total pages, status automatically changes to "completed" and reading goals are updated. Users can only update their own books.',
  })
  @ApiParam({ name: 'id', type: Number, description: 'User-book ID' })
  @ApiBody({ type: UpdateProgressDto })
  @ApiResponse({
    status: 200,
    description: 'Reading progress successfully updated',
    type: UserBookResponseDto,
  })
  @ApiResponse({
    status: 400,
    description: 'Bad Request - Invalid page number',
  })
  @ApiResponse({
    status: 401,
    description: 'Unauthorized - Invalid or missing JWT token',
  })
  @ApiResponse({
    status: 403,
    description: 'Forbidden - You can only update your own user-books',
  })
  @ApiResponse({
    status: 404,
    description: 'Not Found - User-book with the specified ID does not exist',
  })
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
  @ApiOperation({
    summary: 'Remove book from library',
    description:
      'Permanently remove a book from your library. This action cannot be undone. Users can only remove their own books.',
  })
  @ApiParam({ name: 'id', type: Number, description: 'User-book ID' })
  @ApiResponse({
    status: 204,
    description: 'Book successfully removed from library',
  })
  @ApiResponse({
    status: 401,
    description: 'Unauthorized - Invalid or missing JWT token',
  })
  @ApiResponse({
    status: 403,
    description: 'Forbidden - You can only delete your own user-books',
  })
  @ApiResponse({
    status: 404,
    description: 'Not Found - User-book with the specified ID does not exist',
  })
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
