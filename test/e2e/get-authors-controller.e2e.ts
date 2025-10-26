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
  const apiEndPoint = '/api/authors';

  beforeAll(async () => {
    app = await TestAppManagerUtil.create();

    authorRepository = app.get<Repository<Author>>(getRepositoryToken(Author));
    authorUtil = new AuthorUtil(app.get<AuthorService>(AuthorService));
  });

  afterAll(async () => {
    await app.close();
  });

  describe('EMPTY cases', () => {
    beforeAll(async () => {
      await authorUtil.createAuthors(15);
    });

    afterAll(async () => {
      await authorRepository.clear();
    });

    it('SHOULD return empty data when no authors match search', async () => {
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
    beforeAll(async () => {
      await authorUtil.createAuthors(15);
    });

    afterAll(async () => {
      await authorRepository.clear();
    });

    it('SHOULD return all authors when no query params are provided', async () => {
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

    it('SHOULD perform case-insensitive search by firstName', async () => {
      const search = 'author10';
      const response = await request(app.getHttpServer())
        .get(apiEndPoint)
        .query({ search })
        .expect(HttpStatus.OK);

      expect(response.body.data.length).toBe(1);
      expect(response.body.data[0].firstName.toLowerCase()).toBe(search);
    });

    it('SHOULD perform case-insensitive search by lastName', async () => {
      const search = 'test10';
      const response = await request(app.getHttpServer())
        .get(apiEndPoint)
        .query({ search })
        .expect(HttpStatus.OK);

      expect(response.body.data.length).toBe(1);
      expect(response.body.data[0].lastName.toLowerCase()).toBe(search);
    });
  });
});
