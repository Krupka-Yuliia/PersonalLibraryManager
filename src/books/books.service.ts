import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Book } from './book.enity';
import { Repository } from 'typeorm';
import { CreateBookDto } from './dto/create-book.dto';
import { UpdateBookDto } from './dto/update-book.dto';
import { Author } from '../authors/author.entity';
import * as fs from 'fs';
import * as path from 'path';
import { Genre } from '../genres/genre.entity';

@Injectable()
export class BooksService {
  constructor(
    @InjectRepository(Book)
    private readonly booksRepository: Repository<Book>,
    @InjectRepository(Author)
    private readonly authorRepository: Repository<Author>,
    @InjectRepository(Genre)
    private readonly genreRepository: Repository<Genre>,
  ) {}

  async create(createBookDto: CreateBookDto, file?: Express.Multer.File) {
    const book = this.booksRepository.create(createBookDto);

    if (createBookDto.authorId) {
      const author = await this.authorRepository.findOne({
        where: { id: createBookDto.authorId },
      });
      if (!author) {
        throw new BadRequestException('Author not found');
      }
      book.author = author;
    }

    if (createBookDto.genreId) {
      const genre = await this.genreRepository.findOne({
        where: { id: createBookDto.genreId },
      });
      if (!genre) {
        throw new BadRequestException('Genre not found');
      }
      book.genre = genre;
    }

    if (file) {
      book.cover_url = `/uploads/covers/${file.filename}`;
    }

    return this.booksRepository.save(book);
  }

  async findAll(): Promise<Book[]> {
    return await this.booksRepository.find({ relations: ['author', 'genre'] });
  }

  async findOne(id: number): Promise<Book> {
    const book = await this.booksRepository.findOne({
      where: { id },
      relations: ['author', 'genre'],
    });
    if (!book) {
      throw new NotFoundException(`Book with id ${id} not found`);
    }
    return book;
  }

  async update(
    id: number,
    updateBookDto: UpdateBookDto,
    file?: Express.Multer.File,
  ): Promise<Book> {
    if (updateBookDto.year && updateBookDto.year > new Date().getFullYear()) {
      throw new BadRequestException(
        'Year cannot be greater than the current year',
      );
    }

    const book = await this.findOne(id);

    if (file && book.cover_url) {
      const oldFilePath = path.join(process.cwd(), book.cover_url);
      if (fs.existsSync(oldFilePath)) {
        fs.unlinkSync(oldFilePath);
      }
    }

    Object.assign(book, updateBookDto);

    if (file) {
      book.cover_url = `/uploads/covers/${file.filename}`;
    }

    return await this.booksRepository.save(book);
  }

  async remove(id: number): Promise<void> {
    const book = await this.findOne(id);

    if (book.cover_url) {
      const filePath = path.join(process.cwd(), book.cover_url);
      if (fs.existsSync(filePath)) {
        fs.unlinkSync(filePath);
      }
    }

    await this.booksRepository.remove(book);
  }
}
