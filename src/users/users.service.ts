import { Injectable } from '@nestjs/common';
import { users } from './users.mock';

@Injectable()
export class UsersService {
  private users = users;

  findAll() {
    return this.users;
  }

  findOne(id: number) {
    return this.users.find((user) => user.id === id);
  }
}
