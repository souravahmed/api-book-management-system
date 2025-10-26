import { getRepositoryToken } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Author } from '@/author/entities/author.entity';
import request from 'supertest';
import { HttpStatus, INestApplication } from '@nestjs/common';
import { TestAppManagerUtil } from '@test/util/test-app-manager.util';
import { Book } from '@/book/entities/book.entity';
import { UpdateBookDto } from '@/book/dto/update-book.dto';
import { dummyBook } from '@test/dummy/book.dummy';
import { dummyAuthor } from '@test/dummy/author.dummy';

describe('/books (PATCH)', () => {
  let app: INestApplication;
  let authorRepository: Repository<Author>;
  let bookRepository: Repository<Book>;
  const getApiEndPoint = (id: string) => `/api/books/${id}`;

  beforeAll(async () => {
    app = await TestAppManagerUtil.create();

    authorRepository = app.get<Repository<Author>>(getRepositoryToken(Author));
    bookRepository = app.get<Repository<Book>>(getRepositoryToken(Book));
  });

  afterAll(async () => {
    await app.close();
  });

  describe('INVALID Payload', () => {
    let createdAuthor: Author;
    let createdBook: Book;

    beforeAll(async () => {
      createdAuthor = await authorRepository.save({ ...dummyAuthor });
      createdBook = await bookRepository.save({
        ...dummyBook,
        author: { id: createdAuthor.id },
      });
    });

    afterAll(async () => {
      await bookRepository.clear();
      await authorRepository.clear();
    });

    it('SHOULD return 400 when isbn is invalid', async () => {
      const response = await request(app.getHttpServer())
        .patch(getApiEndPoint(createdBook.id))
        .send({
          isbn: '123',
        } as UpdateBookDto)
        .expect(400);

      expect(response.body.message).toContain('isbn must be an ISBN');
    });
  });

  describe('VALID Payload', () => {
    let createdAuthor: Author;
    let firstBook: Book;
    let secondBook: Book;

    beforeAll(async () => {
      createdAuthor = await authorRepository.save({ ...dummyAuthor });
      firstBook = await bookRepository.save({
        ...dummyBook,
        author: { id: createdAuthor.id },
      });
      secondBook = await bookRepository.save({
        ...dummyBook,
        isbn: '1-56619-909-3',
        author: { id: createdAuthor.id },
      });
    });

    afterAll(async () => {
      await bookRepository.clear();
      await authorRepository.clear();
    });

    it('SHOULD update author and return 200', async () => {
      const updatedBookDto = {
        title: 'Updated Book Title',
      } as UpdateBookDto;

      const response = await request(app.getHttpServer())
        .patch(getApiEndPoint(firstBook.id))
        .send(updatedBookDto)
        .expect(HttpStatus.OK);

      expect(response.body.title).toBe(updatedBookDto.title);
    });

    it('SHOULD return 404 if book does not exist', async () => {
      const response = await request(app.getHttpServer())
        .patch(getApiEndPoint('non-existing-id'))
        .send({
          title: 'Updated Book Title',
        } as UpdateBookDto)
        .expect(HttpStatus.NOT_FOUND);

      expect(response.body.message).toContain(
        `Book with ID non-existing-id not found`,
      );
    });

    it('SHOULD return 409 if book already exists', async () => {
      const response = await request(app.getHttpServer())
        .patch(getApiEndPoint(firstBook.id))
        .send({
          isbn: secondBook.isbn,
        } as UpdateBookDto)
        .expect(HttpStatus.CONFLICT);

      expect(response.body.message).toContain(
        `Book with ISBN ${secondBook.isbn} already exists`,
      );

      expect(response.body.error).toBe(HttpStatus[HttpStatus.CONFLICT]);
    });
  });
});
