import { Body, Controller, Post } from '@nestjs/common';
import { AuthorService } from './author.service';
import { CreateAuthorDto } from './dto/create-author.dto';
import { Author } from './entities/author.entity';

@Controller('authors')
export class AuthorController {
  constructor(private readonly authorService: AuthorService) {}

  @Post()
  async createAuthor(
    @Body() createAuthorDto: CreateAuthorDto,
  ): Promise<Author> {
    return await this.authorService.create(createAuthorDto);
  }
}
