import { Author } from '@/author/entities/author.entity';
import { BaseEntity } from '@/common/entities/base.entity';
import { Entity, Column, ManyToOne } from 'typeorm';

@Entity('books')
export class Book extends BaseEntity {
  @Column({ type: 'varchar', length: 255 })
  title: string;

  @Column({ type: 'varchar', length: 17, unique: true })
  isbn: string;

  @Column({ type: 'date', nullable: true })
  publishedDate?: Date;

  @Column({ type: 'varchar', length: 50, nullable: true })
  genre?: string;

  @ManyToOne(() => Author, (author) => author.books, {
    cascade: true,
    nullable: false,
  })
  author: Author;
}
