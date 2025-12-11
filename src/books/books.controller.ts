import {
  Controller,
  Get,
  Post,
  Delete,
  Body,
  Param,
  ParseIntPipe,
  UseInterceptors,
  UploadedFile,
  BadRequestException,
  HttpCode,
  Patch,
  UseGuards,
  Query,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
  ApiConsumes,
  ApiBody,
  ApiParam,
  ApiQuery,
} from '@nestjs/swagger';
import { FileInterceptor } from '@nestjs/platform-express';
import { diskStorage } from 'multer';
import { extname } from 'path';
import { BooksService } from './books.service';
import { CreateBookDto } from './dto/create-book.dto';
import { UpdateBookDto } from './dto/update-book.dto';
import { BookResponseDto } from './dto/book-response.dto';
import { JwtAuthGuard } from '../auth/utils/Guards';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { Role } from '../users/entities/user.entity';

@ApiTags('Books')
@ApiBearerAuth('JWT-auth')
@Controller('books')
@UseGuards(JwtAuthGuard, RolesGuard)
export class BooksController {
  constructor(private readonly booksService: BooksService) {}

  @Post()
  @HttpCode(201)
  @ApiOperation({
    summary: 'Create a new book',
    description:
      'Add a new book to the library. Users can add books if they are not found. Supports uploading a book cover image (jpg, jpeg, png, gif, webp, max 5MB).',
  })
  @ApiConsumes('multipart/form-data')
  @ApiBody({ type: CreateBookDto })
  @ApiResponse({
    status: 201,
    description: 'Book successfully created',
    type: BookResponseDto,
  })
  @ApiResponse({
    status: 400,
    description: 'Bad Request - Invalid input data or file format/size',
  })
  @ApiResponse({
    status: 401,
    description: 'Unauthorized - Invalid or missing JWT token',
  })
  @ApiResponse({
    status: 404,
    description: 'Not Found - Author or genre not found',
  })
  @UseInterceptors(
    FileInterceptor('cover', {
      storage: diskStorage({
        destination: './uploads/covers',
        filename: (req, file, cb) => {
          const uniqueSuffix =
            Date.now() + '-' + Math.round(Math.random() * 1e9);
          const ext = extname(file.originalname);
          cb(null, `book-cover-${uniqueSuffix}${ext}`);
        },
      }),
      fileFilter: (req, file, cb) => {
        if (!file.mimetype.match(/\/(jpg|jpeg|png|gif|webp)$/)) {
          return cb(
            new BadRequestException('Only image files are allowed'),
            false,
          );
        }
        cb(null, true);
      },
      limits: {
        fileSize: 5 * 1024 * 1024,
      },
    }),
  )
  async create(
    @Body() createBookDto: CreateBookDto,
    @UploadedFile() file: Express.Multer.File,
  ) {
    return this.booksService.create(createBookDto, file);
  }

  @Get('search')
  @ApiOperation({
    summary: 'Search books',
    description:
      'Search for books by title, author name, or ISBN. Returns all books if search term is empty.',
  })
  @ApiQuery({
    name: 'q',
    required: false,
    description: 'Search term (title, author, or ISBN)',
  })
  @ApiResponse({
    status: 200,
    description: 'Successfully retrieved search results',
    type: [BookResponseDto],
  })
  @ApiResponse({
    status: 401,
    description: 'Unauthorized - Invalid or missing JWT token',
  })
  async search(@Query('q') searchTerm: string) {
    if (!searchTerm || searchTerm.trim().length === 0) {
      return this.booksService.findAll();
    }
    return this.booksService.search(searchTerm);
  }

  @Get()
  @ApiOperation({
    summary: 'Get all books',
    description:
      'Retrieve all books in the library. Optionally filter by search term (q parameter) to search by title, author, or ISBN.',
  })
  @ApiQuery({
    name: 'q',
    required: false,
    description: 'Optional search term to filter books',
  })
  @ApiResponse({
    status: 200,
    description: 'Successfully retrieved list of books',
    type: [BookResponseDto],
  })
  @ApiResponse({
    status: 401,
    description: 'Unauthorized - Invalid or missing JWT token',
  })
  async findAll(@Query('q') searchTerm?: string) {
    if (searchTerm) {
      return this.booksService.search(searchTerm);
    }
    return this.booksService.findAll();
  }

  @Get(':id')
  @ApiOperation({
    summary: 'Get book by ID',
    description:
      'Retrieve detailed information about a specific book by its ID.',
  })
  @ApiParam({ name: 'id', type: Number, description: 'Book ID' })
  @ApiResponse({
    status: 200,
    description: 'Successfully retrieved book',
    type: BookResponseDto,
  })
  @ApiResponse({
    status: 401,
    description: 'Unauthorized - Invalid or missing JWT token',
  })
  @ApiResponse({
    status: 404,
    description: 'Not Found - Book with the specified ID does not exist',
  })
  async findOne(@Param('id', ParseIntPipe) id: number) {
    return this.booksService.findOne(id);
  }

  @Patch(':id')
  @ApiOperation({
    summary: 'Update book',
    description:
      'Update book information. Supports partial updates. Can optionally upload a new cover image (jpg, jpeg, png, gif, webp, max 5MB).',
  })
  @ApiParam({ name: 'id', type: Number, description: 'Book ID' })
  @ApiConsumes('multipart/form-data')
  @ApiBody({ type: UpdateBookDto })
  @ApiResponse({
    status: 200,
    description: 'Book successfully updated',
    type: BookResponseDto,
  })
  @ApiResponse({
    status: 400,
    description: 'Bad Request - Invalid input data or file format/size',
  })
  @ApiResponse({
    status: 401,
    description: 'Unauthorized - Invalid or missing JWT token',
  })
  @ApiResponse({
    status: 404,
    description: 'Not Found - Book with the specified ID does not exist',
  })
  @UseInterceptors(
    FileInterceptor('cover', {
      storage: diskStorage({
        destination: './uploads/covers',
        filename: (req, file, cb) => {
          const uniqueSuffix =
            Date.now() + '-' + Math.round(Math.random() * 1e9);
          const ext = extname(file.originalname);
          cb(null, `book-cover-${uniqueSuffix}${ext}`);
        },
      }),
      fileFilter: (req, file, cb) => {
        if (!file.mimetype.match(/\/(jpg|jpeg|png|gif|webp)$/)) {
          return cb(
            new BadRequestException('Only image files are allowed'),
            false,
          );
        }
        cb(null, true);
      },
      limits: {
        fileSize: 5 * 1024 * 1024,
      },
    }),
  )
  async update(
    @Param('id', ParseIntPipe) id: number,
    @Body() updateBookDto: UpdateBookDto,
    @UploadedFile() file?: Express.Multer.File,
  ) {
    return this.booksService.update(id, updateBookDto, file);
  }

  @HttpCode(204)
  @Delete(':id')
  @Roles(Role.ADMIN)
  @ApiOperation({
    summary: 'Delete book',
    description:
      'Permanently delete a book from the library. Only ADMIN role can delete books. This action cannot be undone.',
  })
  @ApiParam({ name: 'id', type: Number, description: 'Book ID' })
  @ApiResponse({ status: 204, description: 'Book successfully deleted' })
  @ApiResponse({
    status: 401,
    description: 'Unauthorized - Invalid or missing JWT token',
  })
  @ApiResponse({
    status: 403,
    description: 'Forbidden - Only ADMIN users can delete books',
  })
  @ApiResponse({
    status: 404,
    description: 'Not Found - Book with the specified ID does not exist',
  })
  async remove(@Param('id', ParseIntPipe) id: number) {
    return this.booksService.remove(id);
  }
}
