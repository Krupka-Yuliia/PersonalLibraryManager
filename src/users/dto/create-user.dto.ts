import { IsEmail, IsString, IsEnum, IsNotEmpty } from 'class-validator';

export enum Role {
  USER = 'USER',
  ADMIN = 'ADMIN',
}

export class CreateUserDto {
  @IsString()
  @IsNotEmpty()
  name: string;

  @IsEmail()
  email: string;

  @IsEnum(Role, { message: 'Role must be USER or ADMIN' })
  role: Role;
}
