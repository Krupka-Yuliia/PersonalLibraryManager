import { Module } from '@nestjs/common';
import { BooksService } from './books.service';
import { BooksController } from './books.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Book } from './book.enity';
import { Author } from '../authors/author.entity';
import { Genre } from '../genres/genre.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Book, Author, Genre])],
  providers: [BooksService],
  controllers: [BooksController],
})
export class BooksModule {}
