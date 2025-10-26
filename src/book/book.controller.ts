import { Body, Controller, Get, Post, Query } from '@nestjs/common';
import { BookService } from './book.service';
import { Book } from './entities/book.entity';
import { CreateBookDto } from './dto/create-book.dto';
import { GetBookDto } from './dto/get-book.dto';
import { PaginatedResponse } from '@/common/interfaces/paginated-response.interface';

@Controller('books')
export class BookController {
  constructor(private readonly bookService: BookService) {}

  @Post()
  async createBook(@Body() createBookDto: CreateBookDto): Promise<Book> {
    return this.bookService.createBook(createBookDto);
  }

  @Get()
  async getAuthors(
    @Query() query: GetBookDto,
  ): Promise<PaginatedResponse<Book>> {
    return await this.bookService.getBooks(query);
  }
}
