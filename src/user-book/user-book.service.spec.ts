import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { UserBooksService } from './user-book.service';
import { UserBook } from './user-book.entity';
import { User } from '../users/entities/user.entity';
import { Book } from '../books/book.enity';
import { ReadingGoal } from '../reading-goals/reading-goal.entity';
import { ConflictException } from '@nestjs/common';
import { Status } from './dto/create-user-book.dto';

describe('UserBooksService', () => {
  let service: UserBooksService;

  const mockUserBookRepo = {
    create: jest.fn(),
    save: jest.fn(),
    find: jest.fn(),
    findOne: jest.fn(),
    findOneBy: jest.fn(),
    delete: jest.fn(),
    count: jest.fn(),
    createQueryBuilder: jest.fn(),
  };

  const mockUserRepo = {
    findOneBy: jest.fn(),
  };

  const mockBookRepo = {
    findOneBy: jest.fn(),
  };

  const mockReadingGoalRepo = {
    find: jest.fn(),
    save: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        UserBooksService,
        {
          provide: getRepositoryToken(UserBook),
          useValue: mockUserBookRepo,
        },
        {
          provide: getRepositoryToken(User),
          useValue: mockUserRepo,
        },
        {
          provide: getRepositoryToken(Book),
          useValue: mockBookRepo,
        },
        {
          provide: getRepositoryToken(ReadingGoal),
          useValue: mockReadingGoalRepo,
        },
      ],
    }).compile();

    service = module.get<UserBooksService>(UserBooksService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('create', () => {
    it('should create a user book', async () => {
      const dto = { userId: 1, bookId: 1, status: Status.ToRead };
      const user = { id: 1, name: 'Test User' };
      const book = { id: 1, title: 'Test Book', totalPages: 100 };

      mockUserRepo.findOneBy.mockResolvedValue(user);
      mockBookRepo.findOneBy.mockResolvedValue(book);
      mockUserBookRepo.findOne.mockResolvedValue(null);
      mockUserBookRepo.create.mockReturnValue({ ...dto, user, book });
      mockUserBookRepo.save.mockResolvedValue({ id: 1, ...dto, user, book });

      const result = await service.create(dto);

      expect(result).toBeDefined();
      expect(mockUserBookRepo.save).toHaveBeenCalled();
    });

    it('should throw ConflictException if user book already exists', async () => {
      const dto = { userId: 1, bookId: 1 };
      const user = { id: 1 };
      const book = { id: 1 };
      const existing = { id: 1 };

      mockUserRepo.findOneBy.mockResolvedValue(user);
      mockBookRepo.findOneBy.mockResolvedValue(book);
      mockUserBookRepo.findOne.mockResolvedValue(existing);

      await expect(service.create(dto)).rejects.toThrow(ConflictException);
    });
  });

  describe('updateProgress', () => {
    it('should update progress and change status to Reading when page > 0', async () => {
      const userBook = {
        id: 1,
        currentPage: 0,
        status: Status.ToRead,
        book: { totalPages: 100 },
        user: { id: 1 },
      };

      mockUserBookRepo.findOne.mockResolvedValue(userBook);
      mockUserBookRepo.save.mockResolvedValue({
        ...userBook,
        currentPage: 25,
        status: Status.Reading,
        startedAt: expect.any(Date),
      });

      const result = await service.updateProgress(1, 25);

      expect(result.status).toBe(Status.Reading);
      expect(result.currentPage).toBe(25);
    });

    it('should mark book as completed when currentPage >= totalPages', async () => {
      const userBook = {
        id: 1,
        currentPage: 50,
        status: Status.Reading,
        book: { totalPages: 100 },
        user: { id: 1 },
      };

      mockUserBookRepo.findOne.mockResolvedValue(userBook);
      mockReadingGoalRepo.find.mockResolvedValue([]);
      mockUserBookRepo.count.mockResolvedValue(1);
      mockUserBookRepo.save.mockResolvedValue({
        ...userBook,
        currentPage: 100,
        status: Status.Completed,
        completedAt: expect.any(Date),
      });

      const result = await service.updateProgress(1, 100);

      expect(result.status).toBe(Status.Completed);
    });
  });

  describe('getUserBookStats', () => {
    it('should return statistics with favorite genre and recently added books', async () => {
      const books = [
        {
          id: 1,
          status: Status.Completed,
          rating: 5,
          createdAt: new Date('2024-01-01'),
          book: {
            id: 1,
            title: 'Book 1',
            totalPages: 100,
            genre: { name: 'Fantasy' },
            author: { name: 'Author 1' },
          },
        },
        {
          id: 2,
          status: Status.Completed,
          rating: 4,
          createdAt: new Date('2024-01-02'),
          book: {
            id: 2,
            title: 'Book 2',
            totalPages: 200,
            genre: { name: 'Fantasy' },
            author: { name: 'Author 2' },
          },
        },
      ];

      const queryBuilder = {
        leftJoinAndSelect: jest.fn().mockReturnThis(),
        where: jest.fn().mockReturnThis(),
        andWhere: jest.fn().mockReturnThis(),
        getMany: jest.fn().mockResolvedValue(books),
      };

      mockUserBookRepo.createQueryBuilder.mockReturnValue(queryBuilder);

      const result = await service.getUserBookStats(1);

      expect(result.totalBooks).toBe(2);
      expect(result.completed).toBe(2);
      expect(result.favoriteGenre).toBe('Fantasy');
      expect(result.recentlyAddedBooks).toHaveLength(2);
    });
  });
});
