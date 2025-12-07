import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { BooksService } from './books.service';
import { Book } from './book.enity';
import { Author } from '../authors/author.entity';
import { Genre } from '../genres/genre.entity';

describe('BooksService', () => {
  let service: BooksService;

  const mockBookRepo = {
    create: jest.fn(),
    save: jest.fn(),
    find: jest.fn(),
    findOne: jest.fn(),
    remove: jest.fn(),
    createQueryBuilder: jest.fn(),
  };

  const mockAuthorRepo = {
    findOne: jest.fn(),
  };

  const mockGenreRepo = {
    findOne: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        BooksService,
        {
          provide: getRepositoryToken(Book),
          useValue: mockBookRepo,
        },
        {
          provide: getRepositoryToken(Author),
          useValue: mockAuthorRepo,
        },
        {
          provide: getRepositoryToken(Genre),
          useValue: mockGenreRepo,
        },
      ],
    }).compile();

    service = module.get<BooksService>(BooksService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('search', () => {
    it('should search books by title', async () => {
      const books = [
        { id: 1, title: 'Harry Potter', author: { name: 'J.K. Rowling' } },
      ];

      const queryBuilder = {
        leftJoinAndSelect: jest.fn().mockReturnThis(),
        where: jest.fn().mockReturnThis(),
        getMany: jest.fn().mockResolvedValue(books),
      };

      mockBookRepo.createQueryBuilder.mockReturnValue(queryBuilder);

      const result = await service.search('Harry');

      expect(result).toEqual(books);
      expect(queryBuilder.where).toHaveBeenCalled();
    });

    it('should return all books if search term is empty', async () => {
      const books = [{ id: 1, title: 'Book 1' }];

      mockBookRepo.find.mockResolvedValue(books);

      const result = await service.search('');

      expect(result).toEqual(books);
    });
  });
});
