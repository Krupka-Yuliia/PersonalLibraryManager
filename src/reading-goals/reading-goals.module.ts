import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ReadingGoal } from './reading-goal.entity';
import { User } from '../users/entities/user.entity';
import { Book } from '../books/book.enity';
import { UserBook } from '../user-book/user-book.entity';
import { ReadingGoalsController } from './reading-goals.controller';
import { ReadingGoalsService } from './reading-goals.service';

@Module({
  imports: [TypeOrmModule.forFeature([ReadingGoal, User, Book, UserBook])],
  controllers: [ReadingGoalsController],
  providers: [ReadingGoalsService],
  exports: [ReadingGoalsService],
})
export class ReadingGoalsModule {}
