import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Note } from './note.entity';
import { CreateNoteDto } from './dto/create-note.dto';
import { UpdateNoteDto } from './dto/update-note.dto';
import { UserBook } from '../user-book/user-book.entity';

@Injectable()
export class NoteService {
  constructor(
    @InjectRepository(Note)
    private readonly noteRepo: Repository<Note>,
    @InjectRepository(UserBook)
    private readonly userBookRepo: Repository<UserBook>,
  ) {}

  async create(dto: CreateNoteDto): Promise<Note> {
    const note = this.noteRepo.create(dto);
    return this.noteRepo.save(note);
  }

  async findAll(): Promise<Note[]> {
    return this.noteRepo.find({ relations: ['userBook', 'userBook.user'] });
  }

  async findOne(id: number): Promise<Note> {
    const note = await this.noteRepo.findOne({
      where: { id },
      relations: ['userBook', 'userBook.user'],
    });
    if (!note) throw new NotFoundException(`Note with id ${id} not found`);
    return note;
  }

  async getUserBookById(userBookId: number): Promise<UserBook> {
    const userBook = await this.userBookRepo.findOne({
      where: { id: userBookId },
      relations: ['user'],
    });
    if (!userBook) {
      throw new NotFoundException(`UserBook with id ${userBookId} not found`);
    }
    return userBook;
  }

  async update(id: number, dto: UpdateNoteDto): Promise<Note> {
    const note = await this.findOne(id);

    Object.assign(note, dto);
    note.updatedAt = new Date();

    return this.noteRepo.save(note);
  }

  async remove(id: number): Promise<void> {
    await this.findOne(id);
    await this.noteRepo.delete(id);
  }

  async findByUserBook(userBookId: number): Promise<Note[]> {
    return this.noteRepo.find({
      where: { userBookId: userBookId },
      order: { createdAt: 'DESC' },
    });
  }
}
