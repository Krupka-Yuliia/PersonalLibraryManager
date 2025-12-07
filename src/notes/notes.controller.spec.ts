import { Test, TestingModule } from '@nestjs/testing';
import { NoteController } from './notes.controller';
import { NoteService } from './notes.service';

describe('NotesController', () => {
  let controller: NoteController;

  const mockNoteService = {
    create: jest.fn(),
    findAll: jest.fn(),
    findOne: jest.fn(),
    update: jest.fn(),
    remove: jest.fn(),
    findByUserBook: jest.fn(),
    getUserBookById: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [NoteController],
      providers: [
        {
          provide: NoteService,
          useValue: mockNoteService,
        },
      ],
    }).compile();

    controller = module.get<NoteController>(NoteController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
