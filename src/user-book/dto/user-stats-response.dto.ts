import { ApiProperty } from '@nestjs/swagger';
import { UserBookResponseDto } from './user-book-response.dto';

export class UserStatsResponseDto {
  @ApiProperty({ example: 50, description: 'Total number of books in library' })
  totalBooks: number;

  @ApiProperty({ example: 30, description: 'Number of completed books' })
  completed: number;

  @ApiProperty({
    example: 10,
    description: 'Number of books currently reading',
  })
  reading: number;

  @ApiProperty({ example: 10, description: 'Number of books to read' })
  toRead: number;

  @ApiProperty({ example: 15000, description: 'Total pages read' })
  totalPages: number;

  @ApiProperty({ example: 4.5, description: 'Average rating of rated books' })
  averageRating: number;

  @ApiProperty({
    example: 'Fiction',
    required: false,
    description: 'Most read genre',
  })
  favoriteGenre: string | null;

  @ApiProperty({
    type: [UserBookResponseDto],
    description: 'Recently added books (last 5)',
  })
  recentlyAddedBooks: UserBookResponseDto[];
}
