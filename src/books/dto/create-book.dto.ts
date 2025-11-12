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
  total_pages: number;

  @IsString()
  description?: string;

  @IsInt()
  year?: number;
}
