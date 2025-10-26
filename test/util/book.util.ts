import { BookService } from '@/book/book.service';
import { Book } from '@/book/entities/book.entity';
import { IsbnGenerator } from './isbn.util';

export class BookUtil {
  constructor(private readonly bookService: BookService) {}

  async createBooks(count: number, authorId: string): Promise<Book[]> {
    const books: Book[] = [];

    for (let i = 1; i <= count; i++) {
      const author = await this.bookService.createBook({
        title: `Book${i}`,
        isbn: IsbnGenerator.generate(),
        publishedDate: '2023-01-01',
        genre: 'Fiction',
        authorId: authorId,
      });
      books.push(author);
    }
    return books;
  }
}
