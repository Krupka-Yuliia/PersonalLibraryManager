import { IsEnum } from 'class-validator';
import { Status } from './create-user-book.dto';

export class UpdateStatusDto {
  @IsEnum(Status, { message: 'Status must be to-read, reading or completed' })
  status: Status;
}