import { ApiProperty } from '@nestjs/swagger';
import { UserBookResponseDto } from '../../user-book/dto/user-book-response.dto';

export class NoteResponseDto {
  @ApiProperty({ example: 1 })
  id: number;

  @ApiProperty({ type: () => UserBookResponseDto })
  userBook: UserBookResponseDto;

  @ApiProperty({ example: 'This chapter was amazing!' })
  content: string;

  @ApiProperty({ example: 25, required: false })
  pageNumber?: number;

  @ApiProperty({ example: '2024-01-01T00:00:00.000Z' })
  createdAt: Date;

  @ApiProperty({ example: '2024-01-01T00:00:00.000Z' })
  updatedAt: Date;
}
