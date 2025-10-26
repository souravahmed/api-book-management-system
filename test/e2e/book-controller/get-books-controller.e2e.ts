import { Author } from '@/author/entities/author.entity';
import { HttpStatus, INestApplication } from '@nestjs/common';
import { getRepositoryToken } from '@nestjs/typeorm';
import { TestAppManagerUtil } from '@test/util/test-app-manager.util';
import { Repository } from 'typeorm';
import request from 'supertest';
import { BookUtil } from '@test/util/book.util';
import { BookService } from '@/book/book.service';
import { dummyAuthor } from '@test/dummy/author.dummy';
import { Book } from '@/book/entities/book.entity';
import { GetBookDto } from '@/book/dto/get-book.dto';

describe('/books/:id (GET)', () => {
  let app: INestApplication;
  let authorRepository: Repository<Author>;
  let bookRepository: Repository<Book>;
  let bookUtil: BookUtil;
  const apiEndPoint = '/api/books';

  beforeAll(async () => {
    app = await TestAppManagerUtil.create();

    authorRepository = app.get<Repository<Author>>(getRepositoryToken(Author));
    bookRepository = app.get<Repository<Book>>(getRepositoryToken(Book));

    bookUtil = new BookUtil(app.get<BookService>(BookService));
  });

  afterAll(async () => {
    await app.close();
  });

  describe('EMPTY cases', () => {
    beforeAll(async () => {
      const author = await authorRepository.save({ ...dummyAuthor });

      await bookUtil.createBooks(15, author.id);
    });

    afterAll(async () => {
      await bookRepository.clear();
      await authorRepository.clear();
    });

    it('SHOULD return empty data when no books match search', async () => {
      const response = await request(app.getHttpServer())
        .get(apiEndPoint)
        .query({ search: 'nonexistent' })
        .expect(HttpStatus.OK);

      expect(response.body.data.length).toBe(0);
      expect(response.body.total).toBe(0);
    });

    it('SHOULD handle page number greater than total pages', async () => {
      const response = await request(app.getHttpServer())
        .get(apiEndPoint)
        .query({ page: 10, limit: 2 })
        .expect(HttpStatus.OK);

      expect(response.body.data.length).toBe(0);
      expect(response.body.total).toBe(15);
    });
  });

  describe('SUCCESS cases', () => {
    let jhonAuthor: Author;
    let souravAuthor: Author;

    beforeAll(async () => {
      jhonAuthor = await authorRepository.save({ ...dummyAuthor });
      souravAuthor = await authorRepository.save({
        ...dummyAuthor,
        firstName: 'sourav',
        lastName: 'ahmed',
      });

      await bookUtil.createBooks(10, jhonAuthor.id);
      await bookUtil.createBooks(5, souravAuthor.id);
    });

    afterAll(async () => {
      await bookRepository.clear();
      await authorRepository.clear();
    });

    it('SHOULD return all books when no query params are provided', async () => {
      const response = await request(app.getHttpServer())
        .get(apiEndPoint)
        .expect(HttpStatus.OK);

      expect(Array.isArray(response.body.data)).toBe(true);
      expect(response.body.data.length).toBe(10);
      expect(response.body.total).toBe(15);
    });

    it('SHOULD return paginated authors (page=1, limit=2)', async () => {
      const response = await request(app.getHttpServer())
        .get(apiEndPoint)
        .query({ page: 1, limit: 2 })
        .expect(HttpStatus.OK);

      expect(response.body.data.length).toBe(2);
      expect(response.body.page).toBe(1);
      expect(response.body.limit).toBe(2);
      expect(response.body.total).toBe(15);
    });

    it('SHOULD return next page results (page=2, limit=2)', async () => {
      const response = await request(app.getHttpServer())
        .get(apiEndPoint)
        .query({ page: 8, limit: 2 })
        .expect(HttpStatus.OK);

      expect(response.body.page).toBe(8);
      expect(response.body.data.length).toBe(1);
    });

    it('SHOULD perform case-insensitive search by title', async () => {
      const search = 'book10';
      const response = await request(app.getHttpServer())
        .get(apiEndPoint)
        .query({ search })
        .expect(HttpStatus.OK);

      expect(response.body.data.length).toBe(1);
      expect(response.body.data[0].title.toLowerCase()).toBe(search);
    });

    it('SHOULD perform case-insensitive search by isbn filter by authorId', async () => {
      const search = '978';
      const response = await request(app.getHttpServer())
        .get(apiEndPoint)
        .query({ search, authorId: souravAuthor.id } as GetBookDto)
        .expect(HttpStatus.OK);

      expect(response.body.data.length).toBe(5);

      response.body.data.forEach((book: Book) => {
        expect(book.author.id).toBe(souravAuthor.id);
      });
    });
  });
});
