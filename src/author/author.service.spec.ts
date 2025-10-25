import { Test, TestingModule } from '@nestjs/testing';
import { AuthorService } from './author.service';
import { AppModule } from '@/app.module';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Author } from './entities/author.entity';
import { Repository } from 'typeorm';
import { dummyAuthor } from '@test/dummy-payload/author';

describe('AuthorService', () => {
  let authorService: AuthorService;
  let app: TestingModule;
  let authorRepository: Repository<Author>;

  beforeEach(async () => {
    app = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    authorService = app.get<AuthorService>(AuthorService);
    authorRepository = app.get<Repository<Author>>(getRepositoryToken(Author));
  });

  afterAll(async () => {
    await authorRepository.clear();
    await app.close();
  });

  it('SHOULD create author and return it', async () => {
    const author = await authorService.create({ ...dummyAuthor });

    expect(author).toBeDefined();
    expect(author.id).toBeDefined();
    expect(author.firstName).toBe('John');
    expect(author.lastName).toBe('Doe');
    expect(author.bio).toBe('I am a test author');
    expect(author.birthDate).toBeDefined();

    await authorRepository.delete({ id: author.id });
  });

  it('SHOULD throw error if author already exists', async () => {
    await authorService.create({
      ...dummyAuthor,
    });

    await expect(authorService.create({ ...dummyAuthor })).rejects.toThrow(
      'An author with this name already exists',
    );
  });
});
