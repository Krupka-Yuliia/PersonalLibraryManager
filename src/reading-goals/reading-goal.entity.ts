import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  CreateDateColumn,
} from 'typeorm';
import { User } from '../users/entities/user.entity';

@Entity()
export class ReadingGoal {
  @PrimaryGeneratedColumn()
  id: number;

  @ManyToOne(() => User, { onDelete: 'CASCADE' })
  user: User;

  @Column({ type: 'varchar', nullable: false })
  goalName: string;

  @Column({ type: 'int', nullable: false })
  targetBooks: number;

  @Column({ type: 'int', default: 0 })
  completedBooks: number;

  @Column({ type: 'date', nullable: false })
  startDate: Date;

  @Column({ type: 'date', nullable: false })
  endDate: Date;

  @CreateDateColumn({ type: 'timestamp' })
  createdAt: Date;

  @Column({ type: 'boolean', default: true })
  isActive: boolean;
}
