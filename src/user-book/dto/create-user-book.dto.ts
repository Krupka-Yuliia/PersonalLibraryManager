import { IsInt, Min, Max, IsOptional, IsEnum } from 'class-validator';

export enum Status {
  ToRead = 'to-read',
  Reading = 'reading',
  Completed = 'completed',
}

export class CreateUserBookDto {
  @IsInt()
  userId: number;

  @IsInt()
  bookId: number;

  @IsInt()
  @IsOptional()
  @Min(1)
  @Max(5)
  rating: number;

  @IsEnum(Status, { message: 'Role must be to-read, reading or completed' })
  status: Status;

  @IsOptional()
  completedAt: Date;
}
