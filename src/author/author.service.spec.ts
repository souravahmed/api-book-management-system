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

  afterEach(async () => {
    await authorRepository.clear();
  });

  it('SHOULD create author and return it', async () => {
    const author = await authorService.create({ ...dummyAuthor });

    expect(author).toBeDefined();
    expect(author.id).toBeDefined();
    expect(author.firstName).toBe('John');
    expect(author.lastName).toBe('Doe');
    expect(author.bio).toBe('I am a test author');
    expect(author.birthDate).toBeDefined();
  });

  it('SHOULD throw error if author already exists', async () => {
    await authorService.create({
      ...dummyAuthor,
    });

    await expect(authorService.create({ ...dummyAuthor })).rejects.toThrow(
      'An author with this name already exists',
    );
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
  });

  it('SHOULD get author by ID', async () => {
    const author = await authorService.create({ ...dummyAuthor });
    const foundAuthor = await authorService.getAuthorById(author.id);

    expect(foundAuthor).toBeDefined();
    expect(foundAuthor.id).toBe(author.id);
    expect(foundAuthor.firstName).toBe(author.firstName);
    expect(foundAuthor.lastName).toBe(author.lastName);
    expect(foundAuthor.bio).toBe(author.bio);
    expect(foundAuthor.birthDate).toBe(author.birthDate);
  });

  it('SHOULD throw error if author not found by ID', async () => {
    await expect(
      authorService.getAuthorById('non-existing-id'),
    ).rejects.toThrow('Author with ID non-existing-id not found');
  });

  it('SHOULD update author and return it', async () => {
    const author = await authorService.create({ ...dummyAuthor });
    const updatedAuthor = await authorService.updateAuthor(author.id, {
      firstName: 'UpdatedFirstName',
      birthDate: '2000-01-01',
    });

    expect(updatedAuthor).toBeDefined();
    expect(updatedAuthor.id).toBe(author.id);
    expect(updatedAuthor.firstName).toBe('UpdatedFirstName');
    expect(updatedAuthor.lastName).toBe(author.lastName);
    expect(updatedAuthor.bio).toBe(author.bio);
    expect(updatedAuthor.birthDate).toBe('2000-01-01');
  });

  it('SHOULD throw error if author does not exist', async () => {
    await authorService.create({
      ...dummyAuthor,
    });

    await expect(
      authorService.updateAuthor('non-existing-id', {
        firstName: 'UpdatedFirstName',
      }),
    ).rejects.toThrow('Author with ID non-existing-id not found');
  });
});
