import { Injectable } from '@nestjs/common';
import { users } from './users.mock';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { NotFoundException } from '@nestjs/common';

@Injectable()
export class UsersService {
  private users = users;

  findAll(role?: 'USER' | 'ADMIN') {
    if (role) {
      const rolesArray = this.users.filter((user) => user.role === role);
      if (rolesArray.length === 0) {
        throw new NotFoundException(`Users with role ${role} not found`);
      }
      return rolesArray;
    }
    return this.users;
  }

  findOne(id: number) {
    const user = this.users.find((user) => user.id === id);
    if (!user) {
      throw new NotFoundException(`User with id ${id} not found`);
    }
    return user;
  }

  create(createUserDto: CreateUserDto) {
    const newUser = { id: this.users.length + 1, ...createUserDto };
    this.users.push(newUser);
    return newUser;
  }

  update(id: number, userUpdateDto: UpdateUserDto) {
    this.users = this.users.map((user) => {
      if (user.id === id) {
        return { ...user, ...userUpdateDto };
      }
      return user;
    });
    return this.findOne(id);
  }

  delete(id: number) {
    const removeUser = this.findOne(id);
    this.users = this.users.filter((user) => user.id !== id);
    return removeUser;
  }
}
