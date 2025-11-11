import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  CreateDateColumn,
  UpdateDateColumn,
} from 'typeorm';
import { Author } from '../authors/author.entity';
import { Genre } from '../genres/genre.entity';

@Entity()
export class Book {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ nullable: false })
  title: string;

  @ManyToOne(() => Author, { nullable: false, onDelete: 'CASCADE' })
  author: Author;

  @ManyToOne(() => Genre, { nullable: true, onDelete: 'SET NULL' })
  genre: Genre;

  @Column({ type: 'int' })
  total_pages: number;

  @Column({ type: 'varchar', nullable: true })
  cover_url: string;

  @Column({ type: 'varchar', nullable: true })
  description: string;

  @Column({ type: 'int', nullable: true })
  rating: number;

  @Column({ type: 'int', nullable: true })
  year: number;

  @CreateDateColumn({ type: 'timestamp' })
  created_at: Date;

  @UpdateDateColumn({ type: 'timestamp' })
  updated_at: Date;
}
