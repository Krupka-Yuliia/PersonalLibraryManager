import { IsInt, IsIn, Min, Max, IsOptional } from 'class-validator';

export enum Status {
  ToRead = 'to-read',
  Reading = 'reading',
  Completed = 'completed',
}

export class CreateUserBookDto {
  @IsInt()
  user_id: number;

  @IsInt()
  book_id: number;

  @IsInt()
  @IsOptional()
  @Min(1)
  @Max(5)
  rating?: number;

  @IsIn(['to-read', 'reading', 'completed'])
  status: Status;

  @IsOptional()
  completed_at?: Date;
}
