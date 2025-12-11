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
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
  ApiBody,
  ApiParam,
} from '@nestjs/swagger';
import { ParseIntPipe } from '@nestjs/common';
import { CreateNoteDto } from './dto/create-note.dto';
import { UpdateNoteDto } from './dto/update-note.dto';
import { NoteResponseDto } from './dto/note-response.dto';
import { NoteService } from './notes.service';
import { JwtAuthGuard } from '../auth/utils/Guards';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import { User, Role } from '../users/entities/user.entity';

@ApiTags('Notes')
@ApiBearerAuth('JWT-auth')
@Controller('notes')
@UseGuards(JwtAuthGuard, RolesGuard)
export class NoteController {
  constructor(private readonly noteService: NoteService) {}

  @HttpCode(201)
  @Post()
  @ApiOperation({
    summary: 'Create note for a book',
    description:
      'Add a note or comment to a book in your library. Notes can include page numbers for reference. Users can only create notes for their own books.',
  })
  @ApiBody({ type: CreateNoteDto })
  @ApiResponse({
    status: 201,
    description: 'Note successfully created',
    type: NoteResponseDto,
  })
  @ApiResponse({ status: 400, description: 'Bad Request - Invalid input data' })
  @ApiResponse({
    status: 401,
    description: 'Unauthorized - Invalid or missing JWT token',
  })
  @ApiResponse({
    status: 403,
    description: 'Forbidden - You can only create notes for your own books',
  })
  @ApiResponse({ status: 404, description: 'Not Found - User-book not found' })
  async create(@Body() dto: CreateNoteDto, @CurrentUser() currentUser: User) {
    const userBook = await this.noteService.getUserBookById(dto.userBookId);
    if (userBook.user.id !== currentUser.id) {
      throw new ForbiddenException(
        'You can only create notes for your own books',
      );
    }
    return this.noteService.create(dto);
  }

  @Get()
  @Roles(Role.ADMIN)
  @ApiOperation({
    summary: 'Get all notes',
    description:
      'Retrieve all notes across all users and books. Only ADMIN role can access this endpoint.',
  })
  @ApiResponse({
    status: 200,
    description: 'Successfully retrieved all notes',
    type: [NoteResponseDto],
  })
  @ApiResponse({
    status: 401,
    description: 'Unauthorized - Invalid or missing JWT token',
  })
  @ApiResponse({
    status: 403,
    description: 'Forbidden - Only ADMIN users can access this endpoint',
  })
  findAll() {
    return this.noteService.findAll();
  }

  @Get(':id')
  @ApiOperation({
    summary: 'Get note by ID',
    description:
      'Retrieve a specific note by its ID. Users can only view notes for their own books.',
  })
  @ApiParam({ name: 'id', type: Number, description: 'Note ID' })
  @ApiResponse({
    status: 200,
    description: 'Successfully retrieved note',
    type: NoteResponseDto,
  })
  @ApiResponse({
    status: 401,
    description: 'Unauthorized - Invalid or missing JWT token',
  })
  @ApiResponse({
    status: 403,
    description: 'Forbidden - You can only view your own notes',
  })
  @ApiResponse({
    status: 404,
    description: 'Not Found - Note with the specified ID does not exist',
  })
  async findOne(
    @Param('id', ParseIntPipe) id: number,
    @CurrentUser() currentUser: User,
  ) {
    const note = await this.noteService.findOne(id);
    if (note.userBook.user.id !== currentUser.id) {
      throw new ForbiddenException('You can only view your own notes');
    }
    return note;
  }

  @Patch(':id')
  @ApiOperation({
    summary: 'Update note',
    description:
      'Update note content or page number. Supports partial updates. Users can only update notes for their own books.',
  })
  @ApiParam({ name: 'id', type: Number, description: 'Note ID' })
  @ApiBody({ type: UpdateNoteDto })
  @ApiResponse({
    status: 200,
    description: 'Note successfully updated',
    type: NoteResponseDto,
  })
  @ApiResponse({ status: 400, description: 'Bad Request - Invalid input data' })
  @ApiResponse({
    status: 401,
    description: 'Unauthorized - Invalid or missing JWT token',
  })
  @ApiResponse({
    status: 403,
    description: 'Forbidden - You can only update your own notes',
  })
  @ApiResponse({
    status: 404,
    description: 'Not Found - Note with the specified ID does not exist',
  })
  async update(
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: UpdateNoteDto,
    @CurrentUser() currentUser: User,
  ) {
    const note = await this.noteService.findOne(id);
    if (note.userBook.user.id !== currentUser.id) {
      throw new ForbiddenException('You can only update your own notes');
    }
    return this.noteService.update(id, dto);
  }

  @HttpCode(204)
  @Delete(':id')
  @ApiOperation({
    summary: 'Delete note',
    description:
      'Permanently delete a note. This action cannot be undone. Users can only delete notes for their own books.',
  })
  @ApiParam({ name: 'id', type: Number, description: 'Note ID' })
  @ApiResponse({ status: 204, description: 'Note successfully deleted' })
  @ApiResponse({
    status: 401,
    description: 'Unauthorized - Invalid or missing JWT token',
  })
  @ApiResponse({
    status: 403,
    description: 'Forbidden - You can only delete your own notes',
  })
  @ApiResponse({
    status: 404,
    description: 'Not Found - Note with the specified ID does not exist',
  })
  async remove(
    @Param('id', ParseIntPipe) id: number,
    @CurrentUser() currentUser: User,
  ) {
    const note = await this.noteService.findOne(id);
    if (note.userBook.user.id !== currentUser.id) {
      throw new ForbiddenException('You can only delete your own notes');
    }
    return this.noteService.remove(id);
  }

  @Get('user-book/:userBookId')
  @ApiOperation({
    summary: 'Get all notes for a user-book',
    description:
      'Retrieve all notes for a specific book in your library, ordered by creation date (newest first). Users can only view notes for their own books.',
  })
  @ApiParam({ name: 'userBookId', type: Number, description: 'User-book ID' })
  @ApiResponse({
    status: 200,
    description: 'Successfully retrieved notes for the book',
    type: [NoteResponseDto],
  })
  @ApiResponse({
    status: 401,
    description: 'Unauthorized - Invalid or missing JWT token',
  })
  @ApiResponse({
    status: 403,
    description: 'Forbidden - You can only view notes for your own books',
  })
  @ApiResponse({
    status: 404,
    description: 'Not Found - User-book with the specified ID does not exist',
  })
  async findByUserBook(
    @Param('userBookId', ParseIntPipe) userBookId: number,
    @CurrentUser() currentUser: User,
  ) {
    const userBook = await this.noteService.getUserBookById(userBookId);
    if (userBook.user.id !== currentUser.id) {
      throw new ForbiddenException(
        'You can only view notes for your own books',
      );
    }
    return this.noteService.findByUserBook(userBookId);
  }
}
