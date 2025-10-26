import {
  ConflictException,
  Injectable,
  Logger,
  NotFoundException,
} from '@nestjs/common';
import { Book } from './entities/book.entity';
import { InjectRepository } from '@nestjs/typeorm';
import { FindOptionsWhere, ILike, Repository } from 'typeorm';
import { CreateBookDto } from './dto/create-book.dto';
import { AuthorService } from '@/author/author.service';
import { PaginatedResponse } from '@/common/interfaces/paginated-response.interface';
import { GetBookDto } from './dto/get-book.dto';
import { UpdateBookDto } from './dto/update-book.dto';

@Injectable()
export class BookService {
  private readonly logger = new Logger(BookService.name);

  constructor(
    @InjectRepository(Book)
    private readonly bookRepository: Repository<Book>,
    private readonly authorService: AuthorService,
  ) {}

  async createBook(createBookDto: CreateBookDto): Promise<Book> {
    try {
      const { title, isbn, publishedDate, genre, authorId } = createBookDto;

      const [author] = await Promise.all([
        this.authorService.getAuthorById(authorId),
        this.validateUniqueIsbn(isbn),
      ]);

      const book = this.bookRepository.create({
        title,
        isbn,
        publishedDate,
        genre,
        author,
      });

      return await this.bookRepository.save(book);
    } catch (error) {
      this.logger.error('Error while creating book', error);
      throw error;
    }
  }

  async updateBook(id: string, updateBookDto: UpdateBookDto): Promise<Book> {
    try {
      const book = await this.getBookById(id);

      if (updateBookDto.isbn && updateBookDto.isbn !== book.isbn) {
        await this.validateUniqueIsbn(updateBookDto.isbn);
      }

      Object.assign(book, updateBookDto);

      return this.bookRepository.save(book);
    } catch (error) {
      this.logger.error(`Error while updating book with ID ${id}`, error);
      throw error;
    }
  }

  async getBookByIsbn(isbn: string): Promise<Book> {
    const existingBook = await this.bookRepository.findOne({ where: { isbn } });

    if (!existingBook) {
      throw new NotFoundException(`Book with ISBN ${isbn} not found`);
    }

    return existingBook;
  }

  async getBookById(id: string): Promise<Book> {
    const existingBook = await this.bookRepository.findOne({
      where: { id },
      relations: ['author'],
    });

    if (!existingBook) {
      throw new NotFoundException(`Book with ID ${id} not found`);
    }

    return existingBook;
  }

  async validateUniqueIsbn(isbn: string): Promise<void> {
    const existingBook = await this.bookRepository.findOne({ where: { isbn } });

    if (existingBook) {
      throw new ConflictException(`Book with ISBN ${isbn} already exists`);
    }
  }

  async getBooks(query: GetBookDto): Promise<PaginatedResponse<Book>> {
    const { page = 1, limit = 10, search, authorId } = query;

    const skip = (page - 1) * limit;
    const where = this.buildBookSearchCondition(search, authorId);

    const [books, total] = await this.bookRepository.findAndCount({
      where,
      relations: ['author'],
      skip,
      take: limit,
    });

    return {
      data: books,
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    };
  }

  async deleteBook(id: string): Promise<void> {
    try {
      const book = await this.getBookById(id);
      await this.bookRepository.remove(book);
    } catch (error) {
      this.logger.error('Error while deleting book', error);
      throw error;
    }
  }

  private buildBookSearchCondition(
    search?: string,
    authorId?: string,
  ): FindOptionsWhere<Book> | FindOptionsWhere<Book>[] {
    const searchConditions = search
      ? [{ title: ILike(`%${search}%`) }, { isbn: ILike(`%${search}%`) }]
      : [];

    if (authorId) {
      return searchConditions.length
        ? searchConditions.map((cond) => ({
            ...cond,
            author: { id: authorId },
          }))
        : { author: { id: authorId } };
    }

    return searchConditions.length ? searchConditions : {};
  }
}
