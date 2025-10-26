import { Book } from '@/book/entities/book.entity';
import { BaseEntity } from '@/common/entities/base.entity';
import { Entity, Column, OneToMany } from 'typeorm';

@Entity('authors')
export class Author extends BaseEntity {
  @Column({ type: 'varchar', length: 50 })
  firstName: string;

  @Column({ type: 'varchar', length: 50 })
  lastName: string;

  @Column({ type: 'text', nullable: true })
  bio?: string;

  @Column({ type: 'date', nullable: true })
  birthDate?: Date;

  @OneToMany(() => Book, (book) => book.author)
  books: Book[];
}
