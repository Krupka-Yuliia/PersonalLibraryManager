import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { ReadingGoalsService } from './reading-goals.service';
import { ReadingGoal } from './reading-goal.entity';
import { User } from '../users/entities/user.entity';
import { UserBook } from '../user-book/user-book.entity';
import { NotFoundException } from '@nestjs/common';
import { Status } from '../user-book/dto/create-user-book.dto';

describe('ReadingGoalsService', () => {
  let service: ReadingGoalsService;

  const mockGoalRepo = {
    create: jest.fn(),
    save: jest.fn(),
    find: jest.fn(),
    findOne: jest.fn(),
    remove: jest.fn(),
  };

  const mockUserRepo = {
    findOne: jest.fn(),
  };

  const mockUserBookRepo = {
    count: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ReadingGoalsService,
        {
          provide: getRepositoryToken(ReadingGoal),
          useValue: mockGoalRepo,
        },
        {
          provide: getRepositoryToken(User),
          useValue: mockUserRepo,
        },
        {
          provide: getRepositoryToken(UserBook),
          useValue: mockUserBookRepo,
        },
      ],
    }).compile();

    service = module.get<ReadingGoalsService>(ReadingGoalsService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('create', () => {
    it('should create a reading goal with completed books count', async () => {
      const dto = {
        userId: 1,
        goalName: 'Read 10 books',
        targetBooks: 10,
        startDate: '2024-01-01',
        endDate: '2024-12-31',
      };

      const user = { id: 1, name: 'Test User' };
      const goal = {
        id: 1,
        ...dto,
        completedBooks: 5,
        startDate: new Date(dto.startDate),
        endDate: new Date(dto.endDate),
      };

      mockUserRepo.findOne.mockResolvedValue(user);
      mockUserBookRepo.count.mockResolvedValue(5);
      mockGoalRepo.create.mockReturnValue(goal);
      mockGoalRepo.save.mockResolvedValue(goal);

      const result = await service.create(dto);

      expect(result.completedBooks).toBe(5);
      expect(mockUserBookRepo.count).toHaveBeenCalledWith({
        where: { user: { id: 1 }, status: Status.Completed },
      });
    });

    it('should throw NotFoundException if user not found', async () => {
      const dto = {
        userId: 999,
        goalName: 'Test',
        targetBooks: 10,
        startDate: '2024-01-01',
        endDate: '2024-12-31',
      };

      mockUserRepo.findOne.mockResolvedValue(null);

      await expect(service.create(dto)).rejects.toThrow(NotFoundException);
    });
  });
});
