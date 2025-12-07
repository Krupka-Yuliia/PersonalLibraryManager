import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { AuthorsService } from './authors.service';
import { Author } from './author.entity';

describe('AuthorsService', () => {
  let service: AuthorsService;

  const mockAuthorRepo = {
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
        AuthorsService,
        {
          provide: getRepositoryToken(Author),
          useValue: mockAuthorRepo,
        },
      ],
    }).compile();

    service = module.get<AuthorsService>(AuthorsService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
