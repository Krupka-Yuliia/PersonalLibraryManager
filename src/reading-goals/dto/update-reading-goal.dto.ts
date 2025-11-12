import { PartialType } from '@nestjs/mapped-types';
import { CreateReadingGoalDto } from './create-reading-goals.dto';

export class UpdateReadingGoalDto extends PartialType(CreateReadingGoalDto) {}
