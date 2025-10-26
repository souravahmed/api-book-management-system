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
    firstName: string | undefined,
    lastName: string | undefined,
  ): Promise<Author | null> {
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
    const author = await this.getAuthorById(id);

    if (updateAuthorDto.firstName || updateAuthorDto.lastName) {
      const existingAuthor = await this.getAuthorByFirstNameAndLastName(
        updateAuthorDto.firstName,
        updateAuthorDto.lastName,
      );

      if (existingAuthor && existingAuthor.id !== id) {
        this.logger.warn(
          `Author already exists: ${updateAuthorDto.firstName} ${updateAuthorDto.lastName}`,
        );
        throw new ConflictException('An author with this name already exists');
      }
    }

    Object.assign(author, updateAuthorDto);

    return this.authorRepository.save(author);
  }
}
