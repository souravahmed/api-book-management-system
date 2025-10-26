import { getRepositoryToken } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Author } from '@/author/entities/author.entity';
import request from 'supertest';
import { INestApplication } from '@nestjs/common';
import { TestAppManagerUtil } from '@test/util/test-app-manager.util';
import { dummyAuthor } from '@test/dummy/author.dummy';

describe('/authors (POST)', () => {
  let app: INestApplication;
  let authorRepository: Repository<Author>;
  const apiEndPoint = '/api/authors';

  beforeAll(async () => {
    app = await TestAppManagerUtil.create();

    authorRepository = app.get<Repository<Author>>(getRepositoryToken(Author));
  });

  afterAll(async () => {
    await authorRepository.clear();
    await app.close();
  });

  describe('INVALID Payload', () => {
    it('SHOULD return 400 if firstName is missing', async () => {
      const response = await request(app.getHttpServer())
        .post(apiEndPoint)
        .send({
          lastName: 'Doe',
        });

      expect(response.status).toBe(400);
      expect(response.body.message).toContain('firstName must be a string');
    });

    it('SHOULD return 400 if lastName is missing', async () => {
      const response = await request(app.getHttpServer())
        .post(apiEndPoint)
        .send({
          firstName: 'John',
        });

      expect(response.status).toBe(400);
      expect(response.body.message).toContain('lastName must be a string');
    });

    it("SHOULD return 400 if birthDate isn't in YYYY-MM-DD format", async () => {
      const response = await request(app.getHttpServer())
        .post(apiEndPoint)
        .send({
          firstName: 'John',
          lastName: 'Doe',
          birthDate: '01-01-2000',
        });
      expect(response.status).toBe(400);
      expect(response.body.message).toBe(
        'birthDate must be a valid ISO 8601 date string',
      );
    });
  });

  describe('VALID Payload', () => {
    it('SHOULD create a new author and return 201', async () => {
      const response = await request(app.getHttpServer())
        .post(apiEndPoint)
        .send(dummyAuthor);

      expect(response.status).toBe(201);
      expect(response.body.firstName).toBe(dummyAuthor.firstName);
      expect(response.body.lastName).toBe(dummyAuthor.lastName);
      expect(response.body.bio).toBe(dummyAuthor.bio);
      expect(response.body.birthDate).toBe(dummyAuthor.birthDate);
    });
  });
});
