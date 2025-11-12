import {
  IsInt,
  IsString,
  IsBoolean,
  IsDateString,
  IsOptional,
  Min,
} from 'class-validator';

export class CreateReadingGoalDto {
  @IsInt()
  user_id: number;

  @IsString()
  goal_name: string;

  @IsInt()
  @Min(1)
  target_books: number;

  @IsOptional()
  @IsInt()
  completed_books?: number;

  @IsDateString()
  start_date: string;

  @IsDateString()
  end_date: string;

  @IsOptional()
  @IsBoolean()
  is_active?: boolean;
}
