import { Test, TestingModule } from '@nestjs/testing';
import { ReadingGoalsController } from './reading-goals.controller';

describe('ReadingGoalsController', () => {
  let controller: ReadingGoalsController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [ReadingGoalsController],
    }).compile();

    controller = module.get<ReadingGoalsController>(ReadingGoalsController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
