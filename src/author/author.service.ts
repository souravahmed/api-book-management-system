import {
  ConflictException,
  Injectable,
  Logger,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Author } from './entities/author.entity';
import { ILike, Repository } from 'typeorm';
import { CreateAuthorDto } from './dto/create-author.dto';
import { PaginatedResponse } from '@/common/interfaces/paginated-response.interface';
import { GetAuthorDto } from './dto/get-author.dto';
import { UpdateAuthorDto } from './dto/update-author.dto';

@Injectable()
export class AuthorService {
  private readonly logger = new Logger(AuthorService.name);

  constructor(
    @InjectRepository(Author)
    private readonly authorRepository: Repository<Author>,
  ) {}

  async createAuthor(createAuthorDto: CreateAuthorDto): Promise<Author> {
    try {
      const author = this.authorRepository.create(createAuthorDto);
      return await this.authorRepository.save(author);
    } catch (error) {
      this.logger.error('Error while creating author', error);
      throw error;
    }
  }

  async getAuthorByFirstNameAndLastName(
    firstName: string | undefined,
    lastName: string | undefined,
  ): Promise<Author | null> {
    if (!firstName && !lastName) {
      return null;
    }

    return await this.authorRepository
      .createQueryBuilder('author')
      .where(
        'LOWER(author.firstName) = LOWER(:firstName) AND LOWER(author.lastName) = LOWER(:lastName)',
        {
          firstName: firstName?.trim(),
          lastName: lastName?.trim(),
        },
      )
      .getOne();
  }

  async getAuthors(query: GetAuthorDto): Promise<PaginatedResponse<Author>> {
    const { page = 1, limit = 10, search } = query;

    const skip = (page - 1) * limit;
    const where = search
      ? [
          { firstName: ILike(`%${search}%`) },
          { lastName: ILike(`%${search}%`) },
        ]
      : {};

    const [authors, total] = await this.authorRepository.findAndCount({
      where,
      skip,
      take: limit,
    });

    return {
      data: authors,
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    };
  }

  async getAuthorById(id: string): Promise<Author> {
    const author = await this.authorRepository.findOne({
      where: { id },
      relations: ['books'],
    });

    if (!author) {
      throw new NotFoundException(`Author with ID ${id} not found`);
    }

    return author;
  }

  async updateAuthor(
    id: string,
    updateAuthorDto: UpdateAuthorDto,
  ): Promise<Author> {
    try {
      const author = await this.getAuthorById(id);

      Object.assign(author, updateAuthorDto);

      return this.authorRepository.save(author);
    } catch (error) {
      this.logger.error('Error while updating author', error);
      throw error;
    }
  }

  async deleteAuthor(id: string): Promise<void> {
    try {
      const author = await this.getAuthorById(id);

      if (author.books && author.books.length > 0) {
        throw new ConflictException(
          'Cannot delete author with associated books',
        );
      }

      await this.authorRepository.remove(author);
    } catch (error) {
      this.logger.error('Error while deleting author', error);
      throw error;
    }
  }
}
