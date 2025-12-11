import {
  Controller,
  Get,
  Post,
  Patch,
  Delete,
  Param,
  Body,
  HttpCode,
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
} from '@nestjs/swagger';
import { UpdateReadingGoalDto } from './dto/update-reading-goal.dto';
import { CreateReadingGoalDto } from './dto/create-reading-goals.dto';
import { ReadingGoalResponseDto } from './dto/reading-goal-response.dto';
import { ReadingGoalsService } from './reading-goals.service';
import { JwtAuthGuard } from '../auth/utils/Guards';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import { User, Role } from '../users/entities/user.entity';

@ApiTags('Reading Goals')
@ApiBearerAuth('JWT-auth')
@Controller('reading-goals')
@UseGuards(JwtAuthGuard, RolesGuard)
export class ReadingGoalsController {
  constructor(private readonly readingGoalsService: ReadingGoalsService) {}

  @HttpCode(201)
  @Post()
  @ApiOperation({
    summary: 'Create reading goal',
    description:
      'Create a new reading goal (e.g., "Read 10 books this year"). The system automatically calculates initial completed books count. Progress is automatically updated when books are completed. Users can only create goals for themselves.',
  })
  @ApiBody({ type: CreateReadingGoalDto })
  @ApiResponse({
    status: 201,
    description: 'Reading goal successfully created',
    type: ReadingGoalResponseDto,
  })
  @ApiResponse({ status: 400, description: 'Bad Request - Invalid input data' })
  @ApiResponse({
    status: 401,
    description: 'Unauthorized - Invalid or missing JWT token',
  })
  @ApiResponse({
    status: 403,
    description: 'Forbidden - You can only create goals for yourself',
  })
  @ApiResponse({ status: 404, description: 'Not Found - User not found' })
  async create(
    @Body() dto: CreateReadingGoalDto,
    @CurrentUser() currentUser: User,
  ) {
    if (currentUser.id !== dto.userId) {
      throw new ForbiddenException(
        'You can only create reading goals for yourself',
      );
    }
    return this.readingGoalsService.create(dto);
  }

  @Get()
  @Roles(Role.ADMIN)
  @ApiOperation({
    summary: 'Get all reading goals',
    description:
      'Retrieve all reading goals across all users. Only ADMIN role can access this endpoint.',
  })
  @ApiResponse({
    status: 200,
    description: 'Successfully retrieved all reading goals',
    type: [ReadingGoalResponseDto],
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
    return this.readingGoalsService.findAll();
  }

  @Get(':id')
  @ApiOperation({
    summary: 'Get reading goal by ID',
    description:
      'Retrieve a specific reading goal by ID, including calculated progress percentage. Users can only view their own goals.',
  })
  @ApiParam({ name: 'id', type: Number, description: 'Reading goal ID' })
  @ApiResponse({
    status: 200,
    description: 'Successfully retrieved reading goal with progress',
    type: ReadingGoalResponseDto,
  })
  @ApiResponse({
    status: 401,
    description: 'Unauthorized - Invalid or missing JWT token',
  })
  @ApiResponse({
    status: 403,
    description: 'Forbidden - You can only view your own reading goals',
  })
  @ApiResponse({
    status: 404,
    description:
      'Not Found - Reading goal with the specified ID does not exist',
  })
  async findOne(
    @Param('id', ParseIntPipe) id: number,
    @CurrentUser() currentUser: User,
  ) {
    const goal = await this.readingGoalsService.findOne(id);
    if (goal.user.id !== currentUser.id) {
      throw new ForbiddenException('You can only view your own reading goals');
    }
    return {
      ...goal,
      progressPercentage: Math.round(
        (goal.completedBooks / goal.targetBooks) * 100,
      ),
    };
  }

  @Patch(':id')
  @ApiOperation({
    summary: 'Update reading goal',
    description:
      'Update reading goal information such as target books, dates, or active status. Supports partial updates. Users can only update their own goals.',
  })
  @ApiParam({ name: 'id', type: Number, description: 'Reading goal ID' })
  @ApiBody({ type: UpdateReadingGoalDto })
  @ApiResponse({
    status: 200,
    description: 'Reading goal successfully updated',
    type: ReadingGoalResponseDto,
  })
  @ApiResponse({ status: 400, description: 'Bad Request - Invalid input data' })
  @ApiResponse({
    status: 401,
    description: 'Unauthorized - Invalid or missing JWT token',
  })
  @ApiResponse({
    status: 403,
    description: 'Forbidden - You can only update your own reading goals',
  })
  @ApiResponse({
    status: 404,
    description:
      'Not Found - Reading goal with the specified ID does not exist',
  })
  async update(
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: UpdateReadingGoalDto,
    @CurrentUser() currentUser: User,
  ) {
    const goal = await this.readingGoalsService.findOne(id);
    if (goal.user.id !== currentUser.id) {
      throw new ForbiddenException(
        'You can only update your own reading goals',
      );
    }
    return this.readingGoalsService.update(id, dto);
  }

  @HttpCode(204)
  @Delete(':id')
  @ApiOperation({
    summary: 'Delete reading goal',
    description:
      'Permanently delete a reading goal. This action cannot be undone. Users can only delete their own goals.',
  })
  @ApiParam({ name: 'id', type: Number, description: 'Reading goal ID' })
  @ApiResponse({
    status: 204,
    description: 'Reading goal successfully deleted',
  })
  @ApiResponse({
    status: 401,
    description: 'Unauthorized - Invalid or missing JWT token',
  })
  @ApiResponse({
    status: 403,
    description: 'Forbidden - You can only delete your own reading goals',
  })
  @ApiResponse({
    status: 404,
    description:
      'Not Found - Reading goal with the specified ID does not exist',
  })
  async remove(
    @Param('id', ParseIntPipe) id: number,
    @CurrentUser() currentUser: User,
  ) {
    const goal = await this.readingGoalsService.findOne(id);
    if (goal.user.id !== currentUser.id) {
      throw new ForbiddenException(
        'You can only delete your own reading goals',
      );
    }
    return this.readingGoalsService.remove(id);
  }

  @Get('user/:id')
  @ApiOperation({
    summary: 'Get all reading goals for a user',
    description:
      'Retrieve all reading goals for a specific user, each including calculated progress percentage. Users can only view their own goals.',
  })
  @ApiParam({ name: 'id', type: Number, description: 'User ID' })
  @ApiResponse({
    status: 200,
    description: 'Successfully retrieved user reading goals with progress',
    type: [ReadingGoalResponseDto],
  })
  @ApiResponse({
    status: 401,
    description: 'Unauthorized - Invalid or missing JWT token',
  })
  @ApiResponse({
    status: 403,
    description: 'Forbidden - You can only view your own reading goals',
  })
  async getGoalsByUser(
    @Param('id', ParseIntPipe) userId: number,
    @CurrentUser() currentUser: User,
  ) {
    if (currentUser.id !== userId) {
      throw new ForbiddenException('You can only view your own reading goals');
    }
    const goals = await this.readingGoalsService.getReadingGoalsByUser(userId);
    return goals.map((goal) => ({
      ...goal,
      progressPercentage: Math.round(
        (goal.completedBooks / goal.targetBooks) * 100,
      ),
    }));
  }
}
