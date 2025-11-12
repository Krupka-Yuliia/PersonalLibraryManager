import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  Patch,
  Delete,
  HttpCode,
} from '@nestjs/common';
import { CreateUserBookDto } from './dto/create-user-book.dto';
import { UpdateUserBookDto } from './dto/update-user-book.dto';
import { UserBooksService } from './user-book.service';

@Controller('user-books')
export class UserBooksController {
  constructor(private readonly userBooksService: UserBooksService) {}

  @HttpCode(201)
  @Post()
  create(@Body() dto: CreateUserBookDto) {
    return this.userBooksService.create(dto);
  }

  @Get()
  findAll() {
    return this.userBooksService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.userBooksService.findOne(+id);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() dto: UpdateUserBookDto) {
    return this.userBooksService.update(+id, dto);
  }

  @HttpCode(204)
  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.userBooksService.remove(+id);
  }
}
