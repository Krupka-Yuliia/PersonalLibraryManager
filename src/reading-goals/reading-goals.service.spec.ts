import { Test, TestingModule } from '@nestjs/testing';
import { ReadingGoalsService } from './reading-goals.service';

describe('ReadingGoalsService', () => {
  let service: ReadingGoalsService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [ReadingGoalsService],
    }).compile();

    service = module.get<ReadingGoalsService>(ReadingGoalsService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
