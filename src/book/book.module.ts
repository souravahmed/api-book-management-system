import { Module } from '@nestjs/common';
import { Book } from './entities/book.entity';
import { TypeOrmModule } from '@nestjs/typeorm';

@Module({
  imports: [TypeOrmModule.forFeature([Book])],
})
export class BookModule {}
