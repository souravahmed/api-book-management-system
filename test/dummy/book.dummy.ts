import { CreateBookDto } from '@/book/dto/create-book.dto';

export const dummyBook = {
  title: 'Test Book',
  isbn: '0-306-40615-2',
  publishedDate: '2023-01-01',
  genre: 'Fiction',
  authorId: '1',
} as CreateBookDto;
