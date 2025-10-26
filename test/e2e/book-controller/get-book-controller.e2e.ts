import { Author } from '@/author/entities/author.entity';
import { HttpStatus, INestApplication } from '@nestjs/common';
import { getRepositoryToken } from '@nestjs/typeorm';
import { TestAppManagerUtil } from '@test/util/test-app-manager.util';
import { Repository } from 'typeorm';
import request from 'supertest';
import { Book } from '@/book/entities/book.entity';
import { dummyAuthor } from '@test/dummy/author.dummy';
import { dummyBook } from '@test/dummy/book.dummy';

describe('/books/:id (GET)', () => {
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
    await bookRepository.clear();
    await authorRepository.clear();
    await app.close();
  });

  describe('INVALID Parameter', () => {
    const invalidId = 'invalid-id-12345';

    it("SHOULD return 404 if book doesn't exist", async () => {
      const response = await request(app.getHttpServer()).get(
        getApiEndPoint(invalidId),
      );
      expect(response.status).toBe(HttpStatus.NOT_FOUND);
      expect(response.body.message).toContain(
        `Book with ID ${invalidId} not found`,
      );
    });
  });

  describe('VALID Parameter', () => {
    let createdAuthor: Author;

    beforeAll(async () => {
      createdAuthor = await authorRepository.save({ ...dummyAuthor });
    });

    it('SHOULD return 200 if author exists', async () => {
      const createdBook = await bookRepository.save({
        ...dummyBook,
        author: { id: createdAuthor.id },
      });

      const response = await request(app.getHttpServer())
        .get(getApiEndPoint(createdBook.id))
        .expect(HttpStatus.OK);

      expect(response.body.title).toBe(createdBook.title);
      expect(response.body.isbn).toBe(createdBook.isbn);
      expect(response.body.publishedDate).toBe(createdBook.publishedDate);

      expect(response.body.author.id).toBe(createdAuthor.id);
      expect(response.body.author.firstName).toBe(createdAuthor.firstName);
      expect(response.body.author.lastName).toBe(createdAuthor.lastName);
      expect(response.body.author.bio).toBe(createdAuthor.bio);
      expect(response.body.author.birthDate).toBe(createdAuthor.birthDate);
    });
  });
});
