import { IsString, IsInt, Min, Max } from 'class-validator';

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
  @Min(1)
  @Max(5)
  rating?: number;

  @IsInt()
  year?: number;
}
