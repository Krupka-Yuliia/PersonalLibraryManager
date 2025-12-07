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
import { GenresService } from './genres.service';
import { CreateGenreDto } from './dto/create-genre.dto';
import { UpdateGenreDto } from './dto/update-genre.dto';
import { Genre } from './genre.entity';
import { JwtAuthGuard } from '../auth/utils/Guards';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { Role } from '../users/entities/user.entity';

@Controller('genres')
@UseGuards(JwtAuthGuard, RolesGuard)
export class GenresController {
  constructor(private readonly genresService: GenresService) {}

  @Get()
  findAll(): Promise<Genre[]> {
    return this.genresService.findAll();
  }

  @Get(':id')
  @Roles(Role.ADMIN, Role.USER)
  findOne(@Param('id', ParseIntPipe) id: number): Promise<Genre> {
    return this.genresService.findOne(id);
  }

  @Post()
  create(@Body() dto: CreateGenreDto): Promise<Genre> {
    return this.genresService.create(dto);
  }

  @Patch(':id')
  @Roles(Role.ADMIN)
  update(
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: UpdateGenreDto,
  ): Promise<Genre> {
    return this.genresService.update(id, dto);
  }

  @Delete(':id')
  @HttpCode(204)
  @Roles(Role.ADMIN)
  delete(@Param('id', ParseIntPipe) id: number): Promise<void> {
    return this.genresService.delete(id);
  }
}
