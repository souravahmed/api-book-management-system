import { getRepositoryToken } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Author } from '@/author/entities/author.entity';
import request from 'supertest';
import { HttpStatus, INestApplication } from '@nestjs/common';
import { TestAppManagerUtil } from '@test/util/test-app-manager.util';
import { AuthorUtil } from '@test/util/author.util';
import { AuthorService } from '@/author/author.service';

describe('/authors (PATCH)', () => {
  let app: INestApplication;
  let authorRepository: Repository<Author>;
  let authorUtil: AuthorUtil;
  const getApiEndPoint = (id: string) => `/api/authors/${id}`;

  beforeAll(async () => {
    app = await TestAppManagerUtil.create();

    authorRepository = app.get<Repository<Author>>(getRepositoryToken(Author));
    authorUtil = new AuthorUtil(app.get<AuthorService>(AuthorService));
  });

  afterAll(async () => {
    await app.close();
  });

  describe('INVALID Payload', () => {
    let createdAuthor: Author;

    beforeAll(async () => {
      const [author] = await authorUtil.createAuthors(1);
      createdAuthor = author;
    });

    afterAll(async () => {
      await authorRepository.clear();
    });

    it("SHOULD return 400 if birthDate isn't in YYYY-MM-DD format", async () => {
      const response = await request(app.getHttpServer())
        .patch(getApiEndPoint(createdAuthor.id))
        .send({
          birthDate: '01-01-2000',
        })
        .expect(HttpStatus.BAD_REQUEST);

      expect(response.body.message).toBe(
        'birthDate must be a valid ISO 8601 date string',
      );
    });
  });

  describe('VALID Payload', () => {
    let createdAuthor: Author;

    beforeAll(async () => {
      const [author] = await authorUtil.createAuthors(2);
      createdAuthor = author;
    });

    afterAll(async () => {
      await authorRepository.clear();
    });

    it('SHOULD update author and return 200', async () => {
      const updatedAuthor = {
        firstName: 'Sourav',
        lastName: 'Ahmed',
      };

      const response = await request(app.getHttpServer())
        .patch(getApiEndPoint(createdAuthor.id))
        .send(updatedAuthor)
        .expect(HttpStatus.OK);

      expect(response.body.firstName).toBe(updatedAuthor.firstName);
      expect(response.body.lastName).toBe(updatedAuthor.lastName);
    });

    it('SHOULD return 404 if author does not exist', async () => {
      const response = await request(app.getHttpServer())
        .patch(getApiEndPoint('non-existing-id'))
        .send({
          firstName: 'Sourav',
          lastName: 'Ahmed',
        })
        .expect(HttpStatus.NOT_FOUND);

      expect(response.body.message).toContain(
        `Author with ID non-existing-id not found`,
      );
    });
  });
});
