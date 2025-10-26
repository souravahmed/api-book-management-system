import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
  Query,
} from '@nestjs/common';
import { BookService } from './book.service';
import { Book } from './entities/book.entity';
import { CreateBookDto } from './dto/create-book.dto';
import { GetBookDto } from './dto/get-book.dto';
import { PaginatedResponse } from '@/common/interfaces/paginated-response.interface';
import { UpdateBookDto } from './dto/update-book.dto';

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

  @Get(':id')
  async getBook(@Param('id') id: string): Promise<Book> {
    return await this.bookService.getBookById(id);
  }

  @Patch(':id')
  async updateBook(
    @Param('id') id: string,
    @Body() updateBookDto: UpdateBookDto,
  ): Promise<Book> {
    return await this.bookService.updateBook(id, updateBookDto);
  }

  @Delete(':id')
  async deleteBook(@Param('id') id: string): Promise<void> {
    return await this.bookService.deleteBook(id);
  }
}
