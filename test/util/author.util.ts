import { AuthorService } from '@/author/author.service';
import { Author } from '@/author/entities/author.entity';

export class AuthorUtil {
  constructor(private readonly authorService: AuthorService) {}

  async createAuthors(count: number): Promise<Author[]> {
    const authors: Author[] = [];

    for (let i = 1; i <= count; i++) {
      const author = await this.authorService.createAuthor({
        firstName: `Author${i}`,
        lastName: `Test${i}`,
        bio: `Bio of Author${i}`,
        birthDate: '1990-01-01',
      });
      authors.push(author);
    }
    return authors;
  }
}
