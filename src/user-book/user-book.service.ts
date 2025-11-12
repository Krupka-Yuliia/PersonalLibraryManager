import {
  Injectable,
  NotFoundException,
  ConflictException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { UserBook } from './user-book.entity';
import { CreateUserBookDto } from './dto/create-user-book.dto';
import { UpdateUserBookDto } from './dto/update-user-book.dto';
import { User } from '../users/entities/user.entity';
import { Book } from '../books/book.enity';

@Injectable()
export class UserBooksService {
  constructor(
    @InjectRepository(UserBook)
    private userBookRepo: Repository<UserBook>,
    @InjectRepository(User)
    private userRepo: Repository<User>,
    @InjectRepository(Book)
    private bookRepo: Repository<Book>,
  ) {}

  async create(dto: CreateUserBookDto): Promise<UserBook> {
    const user = await this.userRepo.findOneBy({ id: dto.user_id });
    const book = await this.bookRepo.findOneBy({ id: dto.book_id });

    if (!user || !book) {
      throw new NotFoundException('User or Book not found.');
    }

    const existing = await this.userBookRepo.findOne({
      where: { user: { id: dto.user_id }, book: { id: dto.book_id } },
    });

    if (existing) {
      throw new ConflictException(
        'This user already has a record for this book.',
      );
    }

    const userBook = this.userBookRepo.create({
      user,
      book,
      rating: dto.rating,
      status: dto.status || 'to-read',
    });

    return this.userBookRepo.save(userBook);
  }

  findAll(): Promise<UserBook[]> {
    return this.userBookRepo.find({
      relations: ['user', 'book'],
    });
  }

  async findOne(id: number): Promise<UserBook> {
    const record = await this.userBookRepo.findOne({
      where: { id },
      relations: ['user', 'book'],
    });
    if (!record)
      throw new NotFoundException('UserBook with id: ' + id + ' not found.');
    return record;
  }

  async update(id: number, dto: UpdateUserBookDto): Promise<UserBook> {
    const userBook = await this.findOne(id);
    Object.assign(userBook, dto);
    return this.userBookRepo.save(userBook);
  }

  async remove(id: number): Promise<void> {
    const result = await this.userBookRepo.delete(id);
    if (result.affected === 0)
      throw new NotFoundException('UserBook with id: ' + id + ' not found.');
  }
}
