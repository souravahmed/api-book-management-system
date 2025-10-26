import {
  ConflictException,
  Injectable,
  Logger,
  NotFoundException,
} from '@nestjs/common';
import { Book } from './entities/book.entity';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { CreateBookDto } from './dto/create-book.dto';
import { AuthorService } from '@/author/author.service';

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
}
