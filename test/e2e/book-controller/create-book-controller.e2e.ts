import { getRepositoryToken } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Author } from '@/author/entities/author.entity';
import request from 'supertest';
import { INestApplication } from '@nestjs/common';
import { TestAppManagerUtil } from '@test/util/test-app-manager.util';
import { Book } from '@/book/entities/book.entity';
import { dummyBook } from '@test/dummy/book.dummy';
import { CreateBookDto } from '@/book/dto/create-book.dto';
import { dummyAuthor } from '@test/dummy/author.dummy';

describe('/books (POST)', () => {
  let app: INestApplication;
  let authorRepository: Repository<Author>;
  let bookRepository: Repository<Book>;
  const apiEndPoint = '/api/books';

  beforeAll(async () => {
    app = await TestAppManagerUtil.create();

    authorRepository = app.get<Repository<Author>>(getRepositoryToken(Author));
    bookRepository = app.get<Repository<Book>>(getRepositoryToken(Book));
  });

  afterAll(async () => {
    await bookRepository.clear();
    await authorRepository.clear();
    await app.close();
  });

  describe('INVALID Payload', () => {
    it('SHOULD return 400 if tittle is missing', async () => {
      const { isbn } = dummyBook;

      const response = await request(app.getHttpServer())
        .post(apiEndPoint)
        .send({
          isbn,
        })
        .expect(400);

      expect(response.body.message).toContain('title must be a string');
    });

    it('SHOULD return 400 if isbn is missing', async () => {
      const { title } = dummyBook;

      const response = await request(app.getHttpServer())
        .post(apiEndPoint)
        .send({
          title,
        })
        .expect(400);

      expect(response.body.message).toContain('isbn must be a string');
    });

    it("SHOULD return 400 if publishedDate isn't in YYYY-MM-DD format", async () => {
      const response = await request(app.getHttpServer())
        .post(apiEndPoint)
        .send({
          ...dummyBook,
          publishedDate: '01-01-2000',
        } as CreateBookDto)
        .expect(400);

      expect(response.body.message).toContain(
        'publishedDate must be in YYYY-MM-DD format',
      );
    });

    it('SHOULD return 400 when isbn is invalid', async () => {
      const response = await request(app.getHttpServer())
        .post(apiEndPoint)
        .send({
          ...dummyBook,
          isbn: '123',
        } as CreateBookDto)
        .expect(400);

      expect(response.body.message).toContain(
        'isbn must be a valid ISBN-10 or ISBN-13 format',
      );
    });
  });

  describe('VALID Payload', () => {
    let createdAuthor: Author;

    beforeAll(async () => {
      createdAuthor = await authorRepository.save({ ...dummyAuthor });
    });

    it('SHOULD create a new book and return 201', async () => {
      const response = await request(app.getHttpServer())
        .post(apiEndPoint)
        .send({
          ...dummyBook,
          authorId: createdAuthor.id,
        } as CreateBookDto)
        .expect(201);

      expect(response.body.title).toBe(dummyBook.title);
      expect(response.body.isbn).toBe(dummyBook.isbn);
      expect(response.body.publishedDate).toBe(dummyBook.publishedDate);
      expect(response.body.author.id).toBe(createdAuthor.id);
    });

    it("SHOULD return 404 when authorId doesn't exist", async () => {
      const response = await request(app.getHttpServer())
        .post(apiEndPoint)
        .send({
          ...dummyBook,
        } as CreateBookDto)
        .expect(404);

      expect(response.body.message).toBe(
        `Author with ID ${dummyBook.authorId} not found`,
      );
    });

    it('SHOULD return 409 when isbn already exists', async () => {
      const response = await request(app.getHttpServer())
        .post(apiEndPoint)
        .send({
          ...dummyBook,
          authorId: createdAuthor.id,
        } as CreateBookDto)
        .expect(409);

      expect(response.body.message).toBe(
        `Book with ISBN ${dummyBook.isbn} already exists`,
      );
    });
  });
});
