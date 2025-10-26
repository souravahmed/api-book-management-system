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

  async getBookByIsbn(isbn: string): Promise<Book> {
    const existingBook = await this.bookRepository.findOne({ where: { isbn } });

    if (!existingBook) {
      throw new NotFoundException(`Book with ISBN ${isbn} not found`);
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
