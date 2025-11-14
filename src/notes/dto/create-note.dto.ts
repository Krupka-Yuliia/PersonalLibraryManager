import { IsInt, IsNotEmpty, IsString } from 'class-validator';

export class CreateNoteDto {
  @IsInt()
  @IsNotEmpty()
  userBookId: number;

  @IsString()
  @IsNotEmpty()
  content: string;

  @IsNotEmpty()
  @IsInt()
  pageNumber: number;
}
