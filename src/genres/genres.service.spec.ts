import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { GenresService } from './genres.service';
import { Genre } from './genre.entity';

describe('GenresService', () => {
  let service: GenresService;

  const mockGenreRepo = {
    find: jest.fn(),
    findOne: jest.fn(),
    findOneBy: jest.fn(),
    create: jest.fn(),
    save: jest.fn(),
    remove: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        GenresService,
        {
          provide: getRepositoryToken(Genre),
          useValue: mockGenreRepo,
        },
      ],
    }).compile();

    service = module.get<GenresService>(GenresService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
