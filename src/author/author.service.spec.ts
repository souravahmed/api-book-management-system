import { Test, TestingModule } from '@nestjs/testing';
import { AuthorService } from './author.service';
import { AppModule } from '@/app.module';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Author } from './entities/author.entity';
import { Repository } from 'typeorm';
import { dummyAuthor } from '@test/dummy-payload/author';
import { AuthorUtil } from '@test/util/author-util';

describe('AuthorService', () => {
  let authorService: AuthorService;
  let app: TestingModule;
  let authorRepository: Repository<Author>;
  let authorUtil: AuthorUtil;

  beforeEach(async () => {
    app = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    authorService = app.get<AuthorService>(AuthorService);
    authorRepository = app.get<Repository<Author>>(getRepositoryToken(Author));

    authorUtil = new AuthorUtil(authorService);
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
    const author = await authorService.create({
      ...dummyAuthor,
    });

    await expect(authorService.create({ ...dummyAuthor })).rejects.toThrow(
      'An author with this name already exists',
    );

    await authorRepository.delete({ id: author.id });
  });

  it('SHOULD get authors with pagination', async () => {
    await authorUtil.createAuthors(15);

    const authors = await authorService.getAuthors({
      page: 1,
      limit: 10,
    });

    expect(authors.data.length).toBe(10);
    expect(authors.total).toBe(15);
    expect(authors.page).toBe(1);
    expect(authors.limit).toBe(10);
    expect(authors.totalPages).toBe(2);

    const authors2 = await authorService.getAuthors({
      page: 2,
      limit: 10,
    });

    expect(authors2.data.length).toBe(5);
    expect(authors2.total).toBe(15);
    expect(authors2.page).toBe(2);
    expect(authors2.limit).toBe(10);
    expect(authors2.totalPages).toBe(2);

    await authorRepository.clear();
  });

  it('SHOULD get authors with search', async () => {
    await authorUtil.createAuthors(15);

    const authors = await authorService.getAuthors({
      search: 'Author10',
    });

    expect(authors.data.length).toBe(1);
    expect(authors.total).toBe(1);
    expect(authors.page).toBe(1);
    expect(authors.limit).toBe(10);
    expect(authors.totalPages).toBe(1);

    await authorRepository.clear();
  });
});
