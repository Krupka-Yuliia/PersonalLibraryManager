import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Note } from './note.entity';
import { CreateNoteDto } from './dto/create-note.dto';
import { UpdateNoteDto } from './dto/update-note.dto';

@Injectable()
export class NoteService {
  constructor(
    @InjectRepository(Note)
    private readonly noteRepo: Repository<Note>,
  ) {}

  async create(dto: CreateNoteDto): Promise<Note> {
    const note = this.noteRepo.create(dto);
    return this.noteRepo.save(note);
  }

  async findAll(): Promise<Note[]> {
    return this.noteRepo.find();
  }

  async findOne(id: number): Promise<Note> {
    const note = await this.noteRepo.findOne({ where: { id } });
    if (!note) throw new NotFoundException(`Note with id ${id} not found`);
    return note;
  }

  async update(id: number, dto: UpdateNoteDto): Promise<Note> {
    const note = await this.findOne(id);

    Object.assign(note, dto);
    note.updated_at = new Date();

    return this.noteRepo.save(note);
  }

  async remove(id: number): Promise<void> {
    const note = await this.findOne(id);
    await this.noteRepo.delete(note);
  }

  async findByUserBook(userBookId: number): Promise<Note[]> {
    return this.noteRepo.find({
      where: { user_book_id: userBookId },
      order: { created_at: 'DESC' },
    });
  }
}
