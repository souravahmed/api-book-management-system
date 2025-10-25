import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Author } from './entities/author.entity';
import { AuthorService } from './author.service';

@Module({
  imports: [TypeOrmModule.forFeature([Author])],
  controllers: [],
  providers: [AuthorService],
})
export class AuthorModule {}
