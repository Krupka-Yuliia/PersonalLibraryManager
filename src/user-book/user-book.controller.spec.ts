import { Test, TestingModule } from '@nestjs/testing';
import { UserBooksController } from './user-book.controller';
import { UserBooksService } from './user-book.service';

describe('UserBookController', () => {
  let controller: UserBooksController;

  const mockUserBooksService = {
    create: jest.fn(),
    findAll: jest.fn(),
    findOne: jest.fn(),
    update: jest.fn(),
    remove: jest.fn(),
    updateStatus: jest.fn(),
    updateProgress: jest.fn(),
    findByUser: jest.fn(),
    searchUserBooks: jest.fn(),
    getUserBookStats: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [UserBooksController],
      providers: [
        {
          provide: UserBooksService,
          useValue: mockUserBooksService,
        },
      ],
    }).compile();

    controller = module.get<UserBooksController>(UserBooksController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
