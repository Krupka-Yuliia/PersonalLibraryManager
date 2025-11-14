import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { ReadingGoal } from './reading-goal.entity';
import { UpdateReadingGoalDto } from './dto/update-reading-goal.dto';
import { CreateReadingGoalDto } from './dto/create-reading-goals.dto';
import { User } from '../users/entities/user.entity';

@Injectable()
export class ReadingGoalsService {
  constructor(
    @InjectRepository(ReadingGoal)
    private readingGoalsRepository: Repository<ReadingGoal>,
    @InjectRepository(User)
    private userRepository: Repository<User>,
  ) {}

  async create(dto: CreateReadingGoalDto): Promise<ReadingGoal> {
    const user = await this.userRepository.findOne({
      where: { id: dto.userId },
    });
    if (!user) throw new NotFoundException('User not found');

    const goal = this.readingGoalsRepository.create({
      user,
      goalName: dto.goalName,
      targetBooks: dto.targetBooks,
      completedBooks: dto.completedBooks ?? 0,
      startDate: dto.startDate,
      endDate: dto.endDate,
      isActive: dto.isActive ?? true,
    });

    return this.readingGoalsRepository.save(goal);
  }

  findAll(): Promise<ReadingGoal[]> {
    return this.readingGoalsRepository.find({ relations: ['user'] });
  }

  async findOne(id: number): Promise<ReadingGoal> {
    const goal = await this.readingGoalsRepository.findOne({
      where: { id },
      relations: ['user'],
    });
    if (!goal) throw new NotFoundException('Reading goal not found');
    return goal;
  }

  async update(id: number, dto: UpdateReadingGoalDto): Promise<ReadingGoal> {
    const goal = await this.findOne(id);
    Object.assign(goal, dto);
    return this.readingGoalsRepository.save(goal);
  }

  async remove(id: number): Promise<void> {
    const goal = await this.findOne(id);
    await this.readingGoalsRepository.remove(goal);
  }

  async getReadingGoalsByUser(user_id: number): Promise<ReadingGoal[]> {
    return this.readingGoalsRepository.find({
      where: { user: { id: user_id } },
      relations: ['user'],
    });
  }
}
