import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { UsersModule } from './users/users.module';
import { TypeOrmModule } from '@nestjs/typeorm';
import { User } from './users/entities/user.entity';
import { GenresModule } from './genres/genres.module';
import * as dotenv from 'dotenv';
import { Genre } from './genres/genre.entity';
import { AuthorsModule } from './authors/authors.module';
import { Author } from './authors/author.entity';
import { BooksModule } from './books/books.module';
import { Book } from './books/book.enity';
import { ReadingGoalsModule } from './reading-goals/reading-goals.module';
import { UserBooksModule } from './user-book/user-book.module';
import { UserBook } from './user-book/user-book.entity';
import { ReadingGoal } from './reading-goals/reading-goal.entity';
import { NoteModule } from './notes/notes.module';
import { Note } from './notes/note.entity';

dotenv.config();

@Module({
  imports: [
    TypeOrmModule.forRoot({
      type: 'mysql',
      host: process.env.DB_HOST,
      port: parseInt(process.env.DB_PORT || '3306', 10),
      username: process.env.DB_USER,
      password: process.env.DB_PASSWORD,
      database: process.env.DB_NAME,
      entities: [User, Genre, Author, Book, UserBook, ReadingGoal, Note],
      synchronize: true,
    }),
    UsersModule,
    GenresModule,
    AuthorsModule,
    BooksModule,
    ReadingGoalsModule,
    UserBooksModule,
    NoteModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
