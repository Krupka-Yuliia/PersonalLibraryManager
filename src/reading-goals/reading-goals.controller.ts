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
import { UpdateReadingGoalDto } from './dto/update-reading-goal.dto';
import { CreateReadingGoalDto } from './dto/create-reading-goals.dto';
import { ReadingGoalsService } from './reading-goals.service';
import { JwtAuthGuard } from '../auth/utils/Guards';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import { User, Role } from '../users/entities/user.entity';

@Controller('reading-goals')
@UseGuards(JwtAuthGuard, RolesGuard)
export class ReadingGoalsController {
  constructor(private readonly readingGoalsService: ReadingGoalsService) {}

  @HttpCode(201)
  @Post()
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
  findAll() {
    return this.readingGoalsService.findAll();
  }

  @Get(':id')
  async findOne(@Param('id') id: number, @CurrentUser() currentUser: User) {
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
  async update(
    @Param('id') id: number,
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
  async remove(@Param('id') id: number, @CurrentUser() currentUser: User) {
    const goal = await this.readingGoalsService.findOne(id);
    if (goal.user.id !== currentUser.id) {
      throw new ForbiddenException(
        'You can only delete your own reading goals',
      );
    }
    return this.readingGoalsService.remove(id);
  }

  @Get('user/:id')
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
