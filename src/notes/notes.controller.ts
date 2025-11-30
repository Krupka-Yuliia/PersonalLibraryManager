import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  Patch,
  Delete,
  HttpCode,
  UseGuards,
  ForbiddenException,
} from '@nestjs/common';
import { CreateNoteDto } from './dto/create-note.dto';
import { UpdateNoteDto } from './dto/update-note.dto';
import { NoteService } from './notes.service';
import { JwtAuthGuard } from '../auth/utils/Guards';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import { User, Role } from '../users/entities/user.entity';

@Controller('notes')
@UseGuards(JwtAuthGuard, RolesGuard)
export class NoteController {
  constructor(private readonly noteService: NoteService) {}

  @HttpCode(201)
  @Post()
  async create(@Body() dto: CreateNoteDto, @CurrentUser() currentUser: User) {
    const userBook = await this.noteService.getUserBookById(dto.userBookId);
    if (
      currentUser.role !== Role.ADMIN &&
      userBook.user.id !== currentUser.id
    ) {
      throw new ForbiddenException(
        'You can only create notes for your own books',
      );
    }
    return this.noteService.create(dto);
  }

  @Get()
  @Roles(Role.ADMIN)
  findAll() {
    return this.noteService.findAll();
  }

  @Get(':id')
  async findOne(@Param('id') id: string, @CurrentUser() currentUser: User) {
    const note = await this.noteService.findOne(+id);
    if (note.userBook.user.id !== currentUser.id) {
      throw new ForbiddenException('You can only view your own notes');
    }
    return note;
  }

  @Patch(':id')
  async update(
    @Param('id') id: string,
    @Body() dto: UpdateNoteDto,
    @CurrentUser() currentUser: User,
  ) {
    const note = await this.noteService.findOne(+id);
    if (note.userBook.user.id !== currentUser.id) {
      throw new ForbiddenException('You can only update your own notes');
    }
    return this.noteService.update(+id, dto);
  }

  @HttpCode(204)
  @Delete(':id')
  async remove(@Param('id') id: string, @CurrentUser() currentUser: User) {
    const note = await this.noteService.findOne(+id);
    if (note.userBook.user.id !== currentUser.id) {
      throw new ForbiddenException('You can only delete your own notes');
    }
    return this.noteService.remove(+id);
  }

  @Get('user-book/:userBookId')
  async findByUserBook(
    @Param('userBookId') userBookId: string,
    @CurrentUser() currentUser: User,
  ) {
    const userBook = await this.noteService.getUserBookById(+userBookId);
    if (userBook.user.id !== currentUser.id) {
      throw new ForbiddenException(
        'You can only view notes for your own books',
      );
    }
    return this.noteService.findByUserBook(+userBookId);
  }
}
