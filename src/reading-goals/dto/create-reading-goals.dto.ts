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
  userId: number;

  @IsString()
  goalName: string;

  @IsInt()
  @Min(1)
  targetBooks: number;

  @IsOptional()
  @IsInt()
  completedBooks?: number;

  @IsDateString()
  startDate: string;

  @IsDateString()
  endDate: string;

  @IsOptional()
  @IsBoolean()
  isActive?: boolean;
}
