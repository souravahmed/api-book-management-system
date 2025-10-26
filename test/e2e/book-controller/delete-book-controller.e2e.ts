import { Author } from '@/author/entities/author.entity';
import { HttpStatus, INestApplication } from '@nestjs/common';
import { getRepositoryToken } from '@nestjs/typeorm';
import { TestAppManagerUtil } from '@test/util/test-app-manager.util';
import { Repository } from 'typeorm';
import request from 'supertest';
import { Book } from '@/book/entities/book.entity';
import { dummyBook } from '@test/dummy/book.dummy';
import { dummyAuthor } from '@test/dummy/author.dummy';

describe('/books/:id (DELETE)', () => {
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
      const response = await request(app.getHttpServer()).delete(
        getApiEndPoint(invalidId),
      );
      expect(response.status).toBe(HttpStatus.NOT_FOUND);
      expect(response.body.message).toBe(`Book with ID ${invalidId} not found`);
    });
  });

  describe('VALID Parameter', () => {
    it('SHOULD return 200 after deleting author', async () => {
      const author = await authorRepository.save({ ...dummyAuthor });
      const bookToDelete = await bookRepository.save({
        ...dummyBook,
        author: { id: author.id },
      });

      await request(app.getHttpServer())
        .delete(getApiEndPoint(bookToDelete.id))
        .expect(HttpStatus.OK);

      const deletedBook = await authorRepository.findOneBy({
        id: bookToDelete.id,
      });
      expect(deletedBook).toBeNull();
    });
  });
});
