import {
  Controller,
  Get,
  Post,
  Patch,
  Delete,
  Param,
  Body,
  ParseIntPipe,
  HttpCode,
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
import { GenresService } from './genres.service';
import { CreateGenreDto } from './dto/create-genre.dto';
import { UpdateGenreDto } from './dto/update-genre.dto';
import { GenreResponseDto } from './dto/genre-response.dto';
import { Genre } from './genre.entity';
import { JwtAuthGuard } from '../auth/utils/Guards';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { Role } from '../users/entities/user.entity';

@ApiTags('Genres')
@ApiBearerAuth('JWT-auth')
@Controller('genres')
@UseGuards(JwtAuthGuard, RolesGuard)
export class GenresController {
  constructor(private readonly genresService: GenresService) {}

  @Get()
  @ApiOperation({
    summary: 'Get all genres',
    description:
      'Retrieve a list of all genres in the library. Available to all authenticated users.',
  })
  @ApiResponse({
    status: 200,
    description: 'Successfully retrieved list of genres',
    type: [GenreResponseDto],
  })
  @ApiResponse({
    status: 401,
    description: 'Unauthorized - Invalid or missing JWT token',
  })
  findAll(): Promise<Genre[]> {
    return this.genresService.findAll();
  }

  @Get(':id')
  @Roles(Role.ADMIN, Role.USER)
  @ApiOperation({
    summary: 'Get genre by ID',
    description:
      'Retrieve detailed information about a specific genre by its ID.',
  })
  @ApiParam({ name: 'id', type: Number, description: 'Genre ID' })
  @ApiResponse({
    status: 200,
    description: 'Successfully retrieved genre',
    type: GenreResponseDto,
  })
  @ApiResponse({
    status: 401,
    description: 'Unauthorized - Invalid or missing JWT token',
  })
  @ApiResponse({
    status: 404,
    description: 'Not Found - Genre with the specified ID does not exist',
  })
  findOne(@Param('id', ParseIntPipe) id: number): Promise<Genre> {
    return this.genresService.findOne(id);
  }

  @Post()
  @ApiOperation({
    summary: 'Create genre',
    description:
      "Add a new genre to the library. Available to all authenticated users. Genres can be created when adding books if they don't exist.",
  })
  @ApiBody({ type: CreateGenreDto })
  @ApiResponse({
    status: 201,
    description: 'Genre successfully created',
    type: GenreResponseDto,
  })
  @ApiResponse({ status: 400, description: 'Bad Request - Invalid input data' })
  @ApiResponse({
    status: 401,
    description: 'Unauthorized - Invalid or missing JWT token',
  })
  create(@Body() dto: CreateGenreDto): Promise<Genre> {
    return this.genresService.create(dto);
  }

  @Patch(':id')
  @Roles(Role.ADMIN)
  @ApiOperation({
    summary: 'Update genre',
    description:
      'Update genre information. Only ADMIN role can update genres. Supports partial updates.',
  })
  @ApiParam({ name: 'id', type: Number, description: 'Genre ID' })
  @ApiBody({ type: UpdateGenreDto })
  @ApiResponse({
    status: 200,
    description: 'Genre successfully updated',
    type: GenreResponseDto,
  })
  @ApiResponse({ status: 400, description: 'Bad Request - Invalid input data' })
  @ApiResponse({
    status: 401,
    description: 'Unauthorized - Invalid or missing JWT token',
  })
  @ApiResponse({
    status: 403,
    description: 'Forbidden - Only ADMIN users can update genres',
  })
  @ApiResponse({
    status: 404,
    description: 'Not Found - Genre with the specified ID does not exist',
  })
  update(
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: UpdateGenreDto,
  ): Promise<Genre> {
    return this.genresService.update(id, dto);
  }

  @Delete(':id')
  @HttpCode(204)
  @Roles(Role.ADMIN)
  @ApiOperation({
    summary: 'Delete genre',
    description:
      'Permanently delete a genre from the library. Only ADMIN role can delete genres. Associated books will have their genre set to null. This action cannot be undone.',
  })
  @ApiParam({ name: 'id', type: Number, description: 'Genre ID' })
  @ApiResponse({ status: 204, description: 'Genre successfully deleted' })
  @ApiResponse({
    status: 401,
    description: 'Unauthorized - Invalid or missing JWT token',
  })
  @ApiResponse({
    status: 403,
    description: 'Forbidden - Only ADMIN users can delete genres',
  })
  @ApiResponse({
    status: 404,
    description: 'Not Found - Genre with the specified ID does not exist',
  })
  delete(@Param('id', ParseIntPipe) id: number): Promise<void> {
    return this.genresService.delete(id);
  }
}
