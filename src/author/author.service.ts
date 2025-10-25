import { ConflictException, Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Author } from './entities/author.entity';
import { Repository } from 'typeorm';
import { CreateAuthorDto } from './dto/create-author.dto';

@Injectable()
export class AuthorService {
  private readonly logger = new Logger(AuthorService.name);

  constructor(
    @InjectRepository(Author)
    private readonly authorRepository: Repository<Author>,
  ) {}

  async create(createAuthorDto: CreateAuthorDto): Promise<Author> {
    try {
      const { firstName, lastName } = createAuthorDto;

      const existingAuthor = await this.getAuthorByFirstNameAndLastName(
        firstName,
        lastName,
      );

      if (existingAuthor) {
        this.logger.warn(`Author already exists: ${firstName} ${lastName}`);
        throw new ConflictException('An author with this name already exists');
      }

      const author = this.authorRepository.create(createAuthorDto);
      return await this.authorRepository.save(author);
    } catch (error) {
      this.logger.error('Error while creating author', error);
      throw error;
    }
  }

  async getAuthorByFirstNameAndLastName(
    firstName: string,
    lastName: string,
  ): Promise<Author | null> {
    return await this.authorRepository
      .createQueryBuilder('author')
      .where(
        'LOWER(author.firstName) = LOWER(:firstName) AND LOWER(author.lastName) = LOWER(:lastName)',
        {
          firstName: firstName.trim(),
          lastName: lastName.trim(),
        },
      )
      .getOne();
  }
}
