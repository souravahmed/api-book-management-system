import { AuthorService } from '@/author/author.service';

export class AuthorUtil {
  constructor(private readonly authorService: AuthorService) {}

  async createAuthors(count: number): Promise<void> {
    for (let i = 0; i < count; i++) {
      await this.authorService.create({
        firstName: `Author${i}`,
        lastName: `Test${i}`,
        bio: `Bio of Author${i}`,
        birthDate: '1990-01-01',
      });
    }
  }
}
