import {
  Injectable,
  NotFoundException,
  ConflictException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { UserBook } from './user-book.entity';
import { CreateUserBookDto, Status } from './dto/create-user-book.dto';
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
    const user = await this.userRepo.findOneBy({ id: dto.userId });
    const book = await this.bookRepo.findOneBy({ id: dto.bookId });

    if (!user || !book) {
      throw new NotFoundException('User or Book not found.');
    }

    const existing = await this.userBookRepo.findOne({
      where: { user: { id: dto.userId }, book: { id: dto.bookId } },
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
      status: dto.status || Status.ToRead,
    });

    return this.userBookRepo.save(userBook);
  }

  findAll(): Promise<UserBook[]> {
    return this.userBookRepo.find({
      relations: ['user', 'book', 'book.author', 'book.genre'],
    });
  }

  async findOne(id: number): Promise<UserBook> {
    const record = await this.userBookRepo.findOne({
      where: { id },
      relations: ['user', 'book', 'book.author', 'book.genre'],
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

  async searchUserBooks(
    userId: number,
    searchTerm: string,
  ): Promise<UserBook[]> {
    return this.userBookRepo
      .createQueryBuilder('userBook')
      .leftJoinAndSelect('userBook.book', 'book')
      .leftJoinAndSelect('book.author', 'author')
      .leftJoinAndSelect('book.genre', 'genre')
      .where('userBook.userId = :userId', { userId })
      .andWhere(
        '(LOWER(book.title) LIKE LOWER(:search) OR LOWER(author.name) LIKE LOWER(:search))',
        { search: `%${searchTerm}%` },
      )
      .getMany();
  }

  async findByUser(
    userId: number,
    filters?: {
      status?: string;
      authorId?: number;
      genreId?: number;
    },
  ): Promise<UserBook[]> {
    const query = this.userBookRepo
      .createQueryBuilder('userBook')
      .leftJoinAndSelect('userBook.book', 'book')
      .leftJoinAndSelect('book.author', 'author')
      .leftJoinAndSelect('book.genre', 'genre')
      .leftJoinAndSelect('userBook.user', 'user')
      .where('userBook.userId = :userId', { userId });

    if (filters?.status) {
      query.andWhere('userBook.status = :status', { status: filters.status });
    }

    if (filters?.authorId) {
      query.andWhere('book.authorId = :authorId', {
        authorId: filters.authorId,
      });
    }

    if (filters?.genreId) {
      query.andWhere('book.genreId = :genreId', { genreId: filters.genreId });
    }

    return query.getMany();
  }

  async updateStatus(id: number, status: Status): Promise<UserBook> {
    const userBook = await this.findOne(id);

    userBook.status = status;

    if (status === Status.Completed && !userBook.completedAt) {
      userBook.completedAt = new Date();
    }

    if (status !== Status.Completed) {
      userBook.completedAt = null;
    }

    return this.userBookRepo.save(userBook);
  }

  async updateProgress(id: number, currentPage: number): Promise<UserBook> {
    const userBook = await this.findOne(id);

    userBook.currentPage = currentPage;

    if (userBook.status === Status.ToRead && currentPage > 0) {
      userBook.status = Status.Reading;
      userBook.startedAt = new Date();
    }

    if (
      currentPage >= userBook.book.totalPages &&
      userBook.status !== Status.Completed
    ) {
      userBook.status = Status.Completed;
      userBook.completedAt = new Date();
    }

    return this.userBookRepo.save(userBook);
  }

  async getUserBookStats(userId: number, year?: number) {
    const query = this.userBookRepo
      .createQueryBuilder('userBook')
      .leftJoinAndSelect('userBook.book', 'book')
      .where('userBook.userId = :userId', { userId });

    if (year) {
      query.andWhere('YEAR(userBook.completedAt) = :year', { year });
    }

    const books = await query.getMany();

    return {
      totalBooks: books.length,
      completed: books.filter((b) => b.status === Status.Completed).length,
      reading: books.filter((b) => b.status === Status.Reading).length,
      toRead: books.filter((b) => b.status === Status.ToRead).length,
      totalPages: books
        .filter((b) => b.status === Status.Completed)
        .reduce((sum, b) => sum + (b.book?.totalPages || 0), 0),
      averageRating:
        books.filter((b) => b.rating).length > 0
          ? books
              .filter((b) => b.rating)
              .reduce((sum, b) => sum + b.rating!, 0) /
            books.filter((b) => b.rating).length
          : 0,
    };
  }
}
