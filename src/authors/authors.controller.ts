import {
  Controller,
  Get,
  Post,
  Delete,
  Param,
  Body,
  HttpCode,
  Patch,
  UseGuards,
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
import { AuthorsService } from './authors.service';
import { CreateAuthorDto } from './dto/create-author.dto';
import { UpdateAuthorDto } from './dto/update-author.dto';
import { AuthorResponseDto } from './dto/author-response.dto';
import { JwtAuthGuard } from '../auth/utils/Guards';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { Role } from '../users/entities/user.entity';

@ApiTags('Authors')
@ApiBearerAuth('JWT-auth')
@Controller('authors')
@UseGuards(JwtAuthGuard, RolesGuard)
export class AuthorsController {
  constructor(private readonly authorsService: AuthorsService) {}

  @Get()
  @Roles(Role.ADMIN, Role.USER)
  @ApiOperation({
    summary: 'Get all authors',
    description:
      'Retrieve a list of all authors in the library. Available to all authenticated users.',
  })
  @ApiResponse({
    status: 200,
    description: 'Successfully retrieved list of authors',
    type: [AuthorResponseDto],
  })
  @ApiResponse({
    status: 401,
    description: 'Unauthorized - Invalid or missing JWT token',
  })
  findAll() {
    return this.authorsService.findAll();
  }

  @Get(':id')
  @Roles(Role.ADMIN, Role.USER)
  @ApiOperation({
    summary: 'Get author by ID',
    description:
      'Retrieve detailed information about a specific author by their ID.',
  })
  @ApiParam({ name: 'id', type: Number, description: 'Author ID' })
  @ApiResponse({
    status: 200,
    description: 'Successfully retrieved author',
    type: AuthorResponseDto,
  })
  @ApiResponse({
    status: 401,
    description: 'Unauthorized - Invalid or missing JWT token',
  })
  @ApiResponse({
    status: 404,
    description: 'Not Found - Author with the specified ID does not exist',
  })
  findOne(@Param('id', ParseIntPipe) id: number) {
    return this.authorsService.findOne(id);
  }

  @HttpCode(201)
  @Post()
  @Roles(Role.ADMIN, Role.USER)
  @ApiOperation({
    summary: 'Create author',
    description:
      "Add a new author to the library. Available to all authenticated users. Authors can be created when adding books if they don't exist.",
  })
  @ApiBody({ type: CreateAuthorDto })
  @ApiResponse({
    status: 201,
    description: 'Author successfully created',
    type: AuthorResponseDto,
  })
  @ApiResponse({ status: 400, description: 'Bad Request - Invalid input data' })
  @ApiResponse({
    status: 401,
    description: 'Unauthorized - Invalid or missing JWT token',
  })
  create(@Body() createAuthorDto: CreateAuthorDto) {
    return this.authorsService.create(createAuthorDto);
  }

  @Patch(':id')
  @Roles(Role.ADMIN)
  @ApiOperation({
    summary: 'Update author',
    description:
      'Update author information. Only ADMIN role can update authors. Supports partial updates.',
  })
  @ApiParam({ name: 'id', type: Number, description: 'Author ID' })
  @ApiBody({ type: UpdateAuthorDto })
  @ApiResponse({
    status: 200,
    description: 'Author successfully updated',
    type: AuthorResponseDto,
  })
  @ApiResponse({ status: 400, description: 'Bad Request - Invalid input data' })
  @ApiResponse({
    status: 401,
    description: 'Unauthorized - Invalid or missing JWT token',
  })
  @ApiResponse({
    status: 403,
    description: 'Forbidden - Only ADMIN users can update authors',
  })
  @ApiResponse({
    status: 404,
    description: 'Not Found - Author with the specified ID does not exist',
  })
  update(
    @Param('id', ParseIntPipe) id: number,
    @Body() updateAuthorDto: UpdateAuthorDto,
  ) {
    return this.authorsService.update(id, updateAuthorDto);
  }

  @HttpCode(204)
  @Delete(':id')
  @Roles(Role.ADMIN)
  @ApiOperation({
    summary: 'Delete author',
    description:
      'Permanently delete an author from the library. Only ADMIN role can delete authors. This action will cascade delete associated books. This action cannot be undone.',
  })
  @ApiParam({ name: 'id', type: Number, description: 'Author ID' })
  @ApiResponse({ status: 204, description: 'Author successfully deleted' })
  @ApiResponse({
    status: 401,
    description: 'Unauthorized - Invalid or missing JWT token',
  })
  @ApiResponse({
    status: 403,
    description: 'Forbidden - Only ADMIN users can delete authors',
  })
  @ApiResponse({
    status: 404,
    description: 'Not Found - Author with the specified ID does not exist',
  })
  remove(@Param('id', ParseIntPipe) id: number) {
    return this.authorsService.remove(id);
  }
}
