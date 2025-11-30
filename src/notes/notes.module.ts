import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Note } from './note.entity';
import { NoteController } from './notes.controller';
import { NoteService } from './notes.service';
import { UserBook } from '../user-book/user-book.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Note, UserBook])],
  controllers: [NoteController],
  providers: [NoteService],
})
export class NoteModule {}
