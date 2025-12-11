import { IsEnum } from 'class-validator';
import { Role } from '../entities/user.entity';

export class ChangeRoleDto {
  @IsEnum(Role, { message: 'Role must be USER or ADMIN' })
  role: Role;
}
