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

@Entity('user_books')
@Unique(['user', 'book'])
export class UserBook {
  @PrimaryGeneratedColumn()
  id: number;

  @ManyToOne(() => User, { nullable: false, onDelete: 'CASCADE' })
  user: User;

  @ManyToOne(() => Book, { nullable: false, onDelete: 'CASCADE' })
  book: Book;

  @Column({ type: 'int', nullable: true, comment: 'User rating 1-5' })
  rating?: number;

  @Column({
    type: 'varchar',
    default: 'to-read',
    comment: 'to-read / reading / completed',
  })
  status: string;

  @Column({ type: 'timestamp', nullable: true })
  completed_at?: Date;

  @CreateDateColumn({ type: 'timestamp' })
  created_at: Date;

  @UpdateDateColumn({ type: 'timestamp' })
  updated_at: Date;
}
