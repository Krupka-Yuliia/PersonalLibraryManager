import { Test, TestingModule } from '@nestjs/testing';
import { ReadingGoalsController } from './reading-goals.controller';
import { ReadingGoalsService } from './reading-goals.service';

describe('ReadingGoalsController', () => {
  let controller: ReadingGoalsController;

  const mockReadingGoalsService = {
    create: jest.fn(),
    findAll: jest.fn(),
    findOne: jest.fn(),
    update: jest.fn(),
    remove: jest.fn(),
    getReadingGoalsByUser: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [ReadingGoalsController],
      providers: [
        {
          provide: ReadingGoalsService,
          useValue: mockReadingGoalsService,
        },
      ],
    }).compile();

    controller = module.get<ReadingGoalsController>(ReadingGoalsController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
