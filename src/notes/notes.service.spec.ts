import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { NoteService } from './notes.service';
import { Note } from './note.entity';
import { UserBook } from '../user-book/user-book.entity';

describe('NoteService', () => {
  let service: NoteService;

  const mockNoteRepo = {
    create: jest.fn(),
    save: jest.fn(),
    find: jest.fn(),
    findOne: jest.fn(),
    delete: jest.fn(),
  };

  const mockUserBookRepo = {
    findOne: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        NoteService,
        {
          provide: getRepositoryToken(Note),
          useValue: mockNoteRepo,
        },
        {
          provide: getRepositoryToken(UserBook),
          useValue: mockUserBookRepo,
        },
      ],
    }).compile();

    service = module.get<NoteService>(NoteService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('create', () => {
    it('should create a note', async () => {
      const dto = { userBookId: 1, content: 'Test note', pageNumber: 10 };
      const note = { id: 1, ...dto };

      mockNoteRepo.create.mockReturnValue(note);
      mockNoteRepo.save.mockResolvedValue(note);

      const result = await service.create(dto);

      expect(result).toEqual(note);
    });
  });

  describe('findByUserBook', () => {
    it('should return notes for a user book', async () => {
      const notes = [
        { id: 1, userBookId: 1, content: 'Note 1', pageNumber: 10 },
        { id: 2, userBookId: 1, content: 'Note 2', pageNumber: 20 },
      ];

      mockNoteRepo.find.mockResolvedValue(notes);

      const result = await service.findByUserBook(1);

      expect(result).toEqual(notes);
      expect(mockNoteRepo.find).toHaveBeenCalledWith({
        where: { userBookId: 1 },
        order: { createdAt: 'DESC' },
      });
    });
  });
});
