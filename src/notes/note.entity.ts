import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  JoinColumn,
} from 'typeorm';
import { UserBook } from '../user-book/user-book.entity';

@Entity()
export class Note {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  userBookId: number;

  @ManyToOne(() => UserBook)
  @JoinColumn({ name: 'user_book_id' })
  userBook: UserBook;

  @Column('text')
  content: string;

  @Column()
  pageNumber: number;

  @Column({ type: 'timestamp', default: () => 'CURRENT_TIMESTAMP' })
  createdAt: Date;

  @Column({ type: 'timestamp', default: () => 'CURRENT_TIMESTAMP' })
  updatedAt: Date;
}
