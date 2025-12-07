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
import { ReadingGoal } from '../reading-goals/reading-goal.entity';

@Injectable()
export class UserBooksService {
  constructor(
    @InjectRepository(UserBook)
    private userBookRepo: Repository<UserBook>,
    @InjectRepository(User)
    private userRepo: Repository<User>,
    @InjectRepository(Book)
    private bookRepo: Repository<Book>,
    @InjectRepository(ReadingGoal)
    private readingGoalRepo: Repository<ReadingGoal>,
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
      await this.updateReadingGoals(userBook.user.id);
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

    const wasCompleted = userBook.status === Status.Completed;
    if (
      currentPage >= userBook.book.totalPages &&
      userBook.status !== Status.Completed
    ) {
      userBook.status = Status.Completed;
      userBook.completedAt = new Date();
    }

    const saved = await this.userBookRepo.save(userBook);

    if (!wasCompleted && saved.status === Status.Completed) {
      await this.updateReadingGoals(saved.user.id);
    }

    return saved;
  }

  private async updateReadingGoals(userId: number): Promise<void> {
    const activeGoals = await this.readingGoalRepo.find({
      where: {
        user: { id: userId },
        isActive: true,
      },
    });

    const completedCount = await this.userBookRepo.count({
      where: {
        user: { id: userId },
        status: Status.Completed,
      },
    });

    for (const goal of activeGoals) {
      goal.completedBooks = completedCount;
      await this.readingGoalRepo.save(goal);
    }
  }

  async getUserBookStats(userId: number, year?: number) {
    const query = this.userBookRepo
      .createQueryBuilder('userBook')
      .leftJoinAndSelect('userBook.book', 'book')
      .leftJoinAndSelect('book.genre', 'genre')
      .where('userBook.userId = :userId', { userId });

    if (year) {
      query.andWhere('YEAR(userBook.completedAt) = :year', { year });
    }

    const books = await query.getMany();
    const completedBooks = books.filter((b) => b.status === Status.Completed);
    const booksWithRatings = books.filter((b) => b.rating);

    const genreCounts = new Map<string, number>();
    completedBooks.forEach((b) => {
      if (b.book?.genre?.name) {
        genreCounts.set(
          b.book.genre.name,
          (genreCounts.get(b.book.genre.name) || 0) + 1,
        );
      }
    });

    let favoriteGenre: string | null = null;
    let maxCount = 0;
    genreCounts.forEach((count, genre) => {
      if (count > maxCount) {
        maxCount = count;
        favoriteGenre = genre;
      }
    });

    const recentlyAdded = books
      .sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime())
      .slice(0, 5)
      .map((b) => ({
        id: b.id,
        book: {
          id: b.book.id,
          title: b.book.title,
          author: b.book.author?.name,
          coverUrl: b.book.coverUrl,
        },
        status: b.status,
        createdAt: b.createdAt,
      }));

    return {
      totalBooks: books.length,
      completed: completedBooks.length,
      reading: books.filter((b) => b.status === Status.Reading).length,
      toRead: books.filter((b) => b.status === Status.ToRead).length,
      totalPages: completedBooks.reduce(
        (sum, b) => sum + (b.book?.totalPages || 0),
        0,
      ),
      averageRating:
        booksWithRatings.length > 0
          ? booksWithRatings.reduce((sum, b) => sum + b.rating!, 0) /
            booksWithRatings.length
          : 0,
      favoriteGenre,
      recentlyAddedBooks: recentlyAdded,
    };
  }
}
