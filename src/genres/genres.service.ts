import {
  Injectable,
  NotFoundException,
  ConflictException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Genre } from './genre.entity';
import { CreateGenreDto } from './dto/create-genre.dto';
import { UpdateGenreDto } from './dto/update-genre.dto';

@Injectable()
export class GenresService {
  constructor(
    @InjectRepository(Genre)
    private readonly genreRepository: Repository<Genre>,
  ) {}

  findAll(): Promise<Genre[]> {
    return this.genreRepository.find();
  }

  async findOne(id: number): Promise<Genre> {
    const genre = await this.genreRepository.findOneBy({ id });
    if (!genre) {
      throw new NotFoundException(`Genre with ID ${id} not found`);
    }
    return genre;
  }

  async create(dto: CreateGenreDto): Promise<Genre> {
    const existing = await this.genreRepository.findOneBy({ name: dto.name });
    if (existing) {
      throw new ConflictException(`Genre "${dto.name}" already exists`);
    }
    const genre = this.genreRepository.create(dto);
    return this.genreRepository.save(genre);
  }

  async update(id: number, dto: UpdateGenreDto): Promise<Genre> {
    const genre = await this.findOne(id);

    if (dto.name && dto.name !== genre.name) {
      const existing = await this.genreRepository.findOneBy({ name: dto.name });
      if (existing) {
        throw new ConflictException(`Genre "${dto.name}" already exists`);
      }
    }

    Object.assign(genre, dto);
    return this.genreRepository.save(genre);
  }

  async delete(id: number): Promise<void> {
    const genre = await this.findOne(id);
    await this.genreRepository.remove(genre);
  }
}
