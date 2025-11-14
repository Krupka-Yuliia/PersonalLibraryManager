import { IsInt, IsNotEmpty, IsString } from 'class-validator';

export class CreateNoteDto {
  @IsInt()
  user_book_id: number;

  @IsString()
  @IsNotEmpty()
  content: string;
}
