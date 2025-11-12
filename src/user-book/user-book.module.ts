import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { UserBook } from './user-book.entity';
import { User } from '../users/entities/user.entity';
import { Book } from 'src/books/book.enity';
import { UserBooksService } from './user-book.service';
import { UserBooksController } from './user-book.controller';

@Module({
  imports: [TypeOrmModule.forFeature([UserBook, User, Book])],
  controllers: [UserBooksController],
  providers: [UserBooksService],
})
export class UserBooksModule {}
