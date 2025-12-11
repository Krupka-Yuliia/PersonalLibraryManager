import { ApiProperty } from '@nestjs/swagger';
import { UserResponseDto } from '../../users/dto/user-response.dto';

export class ReadingGoalResponseDto {
  @ApiProperty({ example: 1 })
  id: number;

  @ApiProperty({ type: () => UserResponseDto })
  user: UserResponseDto;

  @ApiProperty({ example: 'Read 10 books in 2024' })
  goalName: string;

  @ApiProperty({ example: 10 })
  targetBooks: number;

  @ApiProperty({ example: 5 })
  completedBooks: number;

  @ApiProperty({ example: 50, description: 'Progress percentage (0-100)' })
  progressPercentage?: number;

  @ApiProperty({ example: '2024-01-01' })
  startDate: string;

  @ApiProperty({ example: '2024-12-31' })
  endDate: string;

  @ApiProperty({ example: true })
  isActive: boolean;

  @ApiProperty({ example: '2024-01-01T00:00:00.000Z' })
  createdAt: Date;

  @ApiProperty({ example: '2024-01-01T00:00:00.000Z' })
  updatedAt: Date;
}
