import { IsString, IsInt, Min } from 'class-validator';

export class CreateBookDto {
  @IsString()
  title: string;

  @IsInt()
  authorId: number;

  @IsInt()
  genreId?: number;

  @IsInt()
  @Min(1)
  totalPages: number;

  @IsString()
  description?: string;

  @IsInt()
  year?: number;
}
