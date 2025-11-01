import { IsEmail, IsString, IsEnum, IsNotEmpty } from 'class-validator';

export class CreateUserDto {
  @IsString()
  @IsNotEmpty()
  name: string;
  @IsEmail()
  email: string;
  @IsEnum(['USER', 'ADMIN'], { message: 'Role must be USER or ADMIN' })
  role: 'USER' | 'ADMIN';
}
