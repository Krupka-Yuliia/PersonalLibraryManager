import { ApiProperty } from '@nestjs/swagger';
import { UserResponseDto } from '../../users/dto/user-response.dto';
import { BookResponseDto } from '../../books/dto/book-response.dto';
import { Status } from './create-user-book.dto';

export class UserBookResponseDto {
  @ApiProperty({ example: 1 })
  id: number;

  @ApiProperty({ type: () => UserResponseDto })
  user: UserResponseDto;

  @ApiProperty({ type: () => BookResponseDto })
  book: BookResponseDto;

  @ApiProperty({ example: 5, required: false })
  rating?: number | null;

  @ApiProperty({ enum: Status, example: Status.Reading })
  status: Status;

  @ApiProperty({ example: 150 })
  currentPage: number;

  @ApiProperty({ example: 50, description: 'Progress percentage (0-100)' })
  progressPercentage?: number;

  @ApiProperty({ example: '2024-01-01T00:00:00.000Z', required: false })
  startedAt?: Date | null;

  @ApiProperty({ example: '2024-01-15T00:00:00.000Z', required: false })
  completedAt?: Date | null;

  @ApiProperty({ example: 'Great book!', required: false })
  review?: string | null;

  @ApiProperty({ example: '2024-01-01T00:00:00.000Z' })
  createdAt: Date;

  @ApiProperty({ example: '2024-01-01T00:00:00.000Z' })
  updatedAt: Date;
}
