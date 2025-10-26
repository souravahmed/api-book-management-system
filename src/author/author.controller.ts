import { Body, Controller, Get, Param, Post, Query } from '@nestjs/common';
import { AuthorService } from './author.service';
import { CreateAuthorDto } from './dto/create-author.dto';
import { Author } from './entities/author.entity';
import { PaginatedResponse } from '@/common/interfaces/paginated-response.interface';
import { GetAuthorDto } from './dto/get-author.dto';

@Controller('authors')
export class AuthorController {
  constructor(private readonly authorService: AuthorService) {}

  @Post()
  async createAuthor(
    @Body() createAuthorDto: CreateAuthorDto,
  ): Promise<Author> {
    return await this.authorService.create(createAuthorDto);
  }

  @Get()
  async getAuthors(
    @Query() query: GetAuthorDto,
  ): Promise<PaginatedResponse<Author>> {
    return await this.authorService.getAuthors(query);
  }

  @Get(':id')
  async getAuthor(@Param('id') id: string): Promise<Author> {
    return await this.authorService.getAuthorById(id);
  }
}
