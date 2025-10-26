import { Author } from '@/author/entities/author.entity';
import { HttpStatus, INestApplication } from '@nestjs/common';
import { getRepositoryToken } from '@nestjs/typeorm';
import { TestAppManagerUtil } from '@test/util/test-app-manager.util';
import { Repository } from 'typeorm';
import request from 'supertest';
import { AuthorUtil } from '@test/util/author.util';
import { AuthorService } from '@/author/author.service';

describe('/authors/:id (GET)', () => {
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
    await authorRepository.clear();
    await app.close();
  });

  describe('INVALID Parameter', () => {
    const invalidId = 'invalid-id-12345';

    it("SHOULD return 404 if author doesn't exist", async () => {
      const response = await request(app.getHttpServer()).get(
        getApiEndPoint(invalidId),
      );
      expect(response.status).toBe(HttpStatus.NOT_FOUND);
      expect(response.body.message).toContain(
        `Author with ID ${invalidId} not found`,
      );
    });
  });

  describe('VALID Parameter', () => {
    let createdAuthors: Author[] = [];

    beforeAll(async () => {
      createdAuthors = await authorUtil.createAuthors(1);
    });

    it('SHOULD return 200 if author exists', async () => {
      const createdAuthor = createdAuthors[0];

      const response = await request(app.getHttpServer())
        .get(getApiEndPoint(createdAuthor.id))
        .expect(HttpStatus.OK);

      expect(response.body.firstName).toBe(createdAuthor.firstName);
      expect(response.body.lastName).toBe(createdAuthor.lastName);
      expect(response.body.bio).toBe(createdAuthor.bio);
      expect(response.body.birthDate).toBe(createdAuthor.birthDate);
    });
  });
});
