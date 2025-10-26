import { Module } from '@nestjs/common';
import { Book } from './entities/book.entity';
import { TypeOrmModule } from '@nestjs/typeorm';
import { BookService } from './book.service';
import { AuthorModule } from '@/author/author.module';
import { BookController } from './book.controller';

@Module({
  imports: [TypeOrmModule.forFeature([Book]), AuthorModule],
  providers: [BookService],
  controllers: [BookController],
})
export class BookModule {}
