import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  Unique,
  CreateDateColumn,
  UpdateDateColumn,
} from 'typeorm';
import { User } from '../users/entities/user.entity';
import { Book } from '../books/book.enity';
import { Status } from './dto/create-user-book.dto';

@Entity('user_books')
@Unique(['user', 'book'])
export class UserBook {
  @PrimaryGeneratedColumn()
  id: number;

  @ManyToOne(() => User, { nullable: false, onDelete: 'CASCADE' })
  user: User;

  @ManyToOne(() => Book, { nullable: false, onDelete: 'CASCADE' })
  book: Book;

  @Column({ type: 'int', nullable: true })
  rating?: number | null;

  @Column({
    type: 'enum',
    enum: Status,
    default: Status.ToRead,
  })
  status: Status;

  @Column({ type: 'int', default: 0 })
  currentPage: number;

  @Column({ type: 'timestamp', nullable: true })
  startedAt?: Date | null;

  @Column({ type: 'timestamp', nullable: true })
  completedAt?: Date | null;

  @Column({ type: 'text', nullable: true })
  review?: string | null;

  @CreateDateColumn({ type: 'timestamp' })
  createdAt: Date;

  @UpdateDateColumn({ type: 'timestamp' })
  updatedAt: Date;
}
