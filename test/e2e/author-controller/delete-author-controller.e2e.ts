import { Author } from '@/author/entities/author.entity';
import { HttpStatus, INestApplication } from '@nestjs/common';
import { getRepositoryToken } from '@nestjs/typeorm';
import { TestAppManagerUtil } from '@test/util/test-app-manager.util';
import { Repository } from 'typeorm';
import request from 'supertest';
import { AuthorUtil } from '@test/util/author.util';
import { AuthorService } from '@/author/author.service';
import { Book } from '@/book/entities/book.entity';
import { dummyBook } from '@test/dummy/book.dummy';

describe('/authors/:id (DELETE)', () => {
  let app: INestApplication;
  let authorRepository: Repository<Author>;
  let bookRepository: Repository<Book>;
  let authorUtil: AuthorUtil;
  const getApiEndPoint = (id: string) => `/api/authors/${id}`;

  beforeAll(async () => {
    app = await TestAppManagerUtil.create();

    authorRepository = app.get<Repository<Author>>(getRepositoryToken(Author));
    bookRepository = app.get<Repository<Book>>(getRepositoryToken(Book));
    authorUtil = new AuthorUtil(app.get<AuthorService>(AuthorService));
  });

  afterAll(async () => {
    await bookRepository.clear();
    await authorRepository.clear();
    await app.close();
  });

  describe('INVALID Parameter', () => {
    const invalidId = 'invalid-id-12345';

    it("SHOULD return 404 if author doesn't exist", async () => {
      const response = await request(app.getHttpServer()).delete(
        getApiEndPoint(invalidId),
      );
      expect(response.status).toBe(HttpStatus.NOT_FOUND);
      expect(response.body.message).toContain(
        `Author with ID ${invalidId} not found`,
      );
    });
  });

  describe('VALID Parameter', () => {
    it('SHOULD return 200 after deleting author', async () => {
      const [authorToDelete] = await authorUtil.createAuthors(1);

      await request(app.getHttpServer())
        .delete(getApiEndPoint(authorToDelete.id))
        .expect(HttpStatus.OK);

      const deletedAuthor = await authorRepository.findOneBy({
        id: authorToDelete.id,
      });
      expect(deletedAuthor).toBeNull();
    });

    it('SHOULD return 409 if author has books', async () => {
      const [authorToDelete] = await authorUtil.createAuthors(1);

      await bookRepository.save({
        ...dummyBook,
        author: { id: authorToDelete.id },
      });

      const response = await request(app.getHttpServer()).delete(
        getApiEndPoint(authorToDelete.id),
      );
      expect(response.status).toBe(HttpStatus.CONFLICT);
      expect(response.body.message).toContain(
        'Cannot delete author with associated books',
      );
    });
  });
});
