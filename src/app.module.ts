import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AuthorModule } from './author/author.module';
import { CommonModule } from './common/common.module';
import { Author } from './author/entities/author.entity';
import { BookModule } from './book/book.module';
import { Book } from './book/entities/book.entity';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
    }),
    TypeOrmModule.forRoot({
      type: 'sqlite',
      database: 'book-management.sqlite',
      entities: [Author, Book],
      synchronize: true,
    }),
    AuthorModule,
    CommonModule,
    BookModule,
  ],
  controllers: [],
  providers: [],
})
export class AppModule {}
