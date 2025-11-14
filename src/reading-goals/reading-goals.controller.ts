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
} from '@nestjs/common';
import { UpdateReadingGoalDto } from './dto/update-reading-goal.dto';
import { CreateReadingGoalDto } from './dto/create-reading-goals.dto';
import { ReadingGoalsService } from './reading-goals.service';

@Controller('reading-goals')
export class ReadingGoalsController {
  constructor(private readonly readingGoalsService: ReadingGoalsService) {}

  @HttpCode(201)
  @Post()
  create(@Body() dto: CreateReadingGoalDto) {
    return this.readingGoalsService.create(dto);
  }

  @Get()
  findAll() {
    return this.readingGoalsService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: number) {
    return this.readingGoalsService.findOne(id);
  }

  @Patch(':id')
  update(@Param('id') id: number, @Body() dto: UpdateReadingGoalDto) {
    return this.readingGoalsService.update(id, dto);
  }

  @HttpCode(204)
  @Delete(':id')
  remove(@Param('id') id: number) {
    return this.readingGoalsService.remove(id);
  }

  @Get('user/:id')
  async getGoalsByUser(@Param('id', ParseIntPipe) userId: number) {
    return this.readingGoalsService.getReadingGoalsByUser(userId);
  }
}
