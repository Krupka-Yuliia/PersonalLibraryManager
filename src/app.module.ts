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
      entities: [User, Genre, Author, Book],
      synchronize: true,
    }),
    UsersModule,
    GenresModule,
    AuthorsModule,
    BooksModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
