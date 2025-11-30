import { User } from '../../users/entities/user.entity';

declare global {
  namespace Express {
    interface User extends User {}
  }
}

export {};

