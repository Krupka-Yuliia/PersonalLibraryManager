import { ApiProperty } from '@nestjs/swagger';
import { AuthorResponseDto } from '../../authors/dto/author-response.dto';
import { GenreResponseDto } from '../../genres/dto/genre-response.dto';

export class BookResponseDto {
  @ApiProperty({ example: 1 })
  id: number;

  @ApiProperty({ example: 'The Great Gatsby' })
  title: string;

  @ApiProperty({ type: () => AuthorResponseDto })
  author: AuthorResponseDto;

  @ApiProperty({ type: () => GenreResponseDto, required: false })
  genre?: GenreResponseDto;

  @ApiProperty({ example: 300 })
  totalPages: number;

  @ApiProperty({ example: 'https://example.com/cover.jpg', required: false })
  coverUrl?: string;

  @ApiProperty({ example: 'A classic novel...', required: false })
  description?: string;

  @ApiProperty({ example: 1925, required: false })
  year?: number;

  @ApiProperty({ example: '2024-01-01T00:00:00.000Z' })
  createdAt: Date;

  @ApiProperty({ example: '2024-01-01T00:00:00.000Z' })
  updatedAt: Date;
}
