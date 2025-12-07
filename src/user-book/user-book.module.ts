import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { UserBook } from './user-book.entity';
import { User } from '../users/entities/user.entity';
import { Book } from '../books/book.enity';
import { ReadingGoal } from '../reading-goals/reading-goal.entity';
import { UserBooksService } from './user-book.service';
import { UserBooksController } from './user-book.controller';

@Module({
  imports: [TypeOrmModule.forFeature([UserBook, User, Book, ReadingGoal])],
  controllers: [UserBooksController],
  providers: [UserBooksService],
  exports: [UserBooksService],
})
export class UserBooksModule {}
