import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  Patch,
  Delete,
  HttpCode,
} from '@nestjs/common';
import { CreateNoteDto } from './dto/create-note.dto';
import { UpdateNoteDto } from './dto/update-note.dto';
import { NoteService } from './notes.service';

@Controller('notes')
export class NoteController {
  constructor(private readonly noteService: NoteService) {}

  @HttpCode(201)
  @Post()
  create(@Body() dto: CreateNoteDto) {
    return this.noteService.create(dto);
  }

  @Get()
  findAll() {
    return this.noteService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.noteService.findOne(+id);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() dto: UpdateNoteDto) {
    return this.noteService.update(+id, dto);
  }

  @HttpCode(204)
  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.noteService.remove(+id);
  }

  @Get('user-book/:userBookId')
  findByUserBook(@Param('userBookId') userBookId: string) {
    return this.noteService.findByUserBook(+userBookId);
  }
}
