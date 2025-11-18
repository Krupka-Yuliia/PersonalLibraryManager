import { IsInt, Min } from 'class-validator';
import { Type } from 'class-transformer';

export class UpdateProgressDto {
  @IsInt()
  @Min(0)
  @Type(() => Number)
  currentPage: number;
}