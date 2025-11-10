import {
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Author } from './author.entity';
import { CreateAuthorDto } from './dto/create-author.dto';
import { UpdateAuthorDto } from './dto/update-author.dto';

@Injectable()
export class AuthorsService {
  constructor(
    @InjectRepository(Author)
    private readonly authorRepository: Repository<Author>,
  ) {}

  findAll(): Promise<Author[]> {
    return this.authorRepository.find();
  }

  async findOne(id: number): Promise<Author> {
    const author = await this.authorRepository.findOne({ where: { id } });
    if (!author) {
      throw new NotFoundException(`Author with ID ${id} not found`);
    }
    return author;
  }

  async create(createAuthorDto: CreateAuthorDto): Promise<Author> {
    const existing = await this.authorRepository.findOneBy({
      name: createAuthorDto.name,
    });

    if (existing) {
      throw new ConflictException(
        `Author "${createAuthorDto.name}" already exists`,
      );
    }

    const author = this.authorRepository.create(createAuthorDto);
    return this.authorRepository.save(author);
  }

  async update(id: number, updateAuthorDto: UpdateAuthorDto): Promise<Author> {
    const author = await this.findOne(id);

    if (updateAuthorDto.name && updateAuthorDto.name !== author.name) {
      const existing = await this.authorRepository.findOneBy({
        name: updateAuthorDto.name,
      });
      if (existing) {
        throw new ConflictException(
          `Author "${updateAuthorDto.name}" already exists`,
        );
      }
    }

    Object.assign(author, updateAuthorDto);
    return this.authorRepository.save(author);
  }

  async remove(id: number): Promise<void> {
    const author = await this.findOne(id);
    await this.authorRepository.remove(author);
  }
}
