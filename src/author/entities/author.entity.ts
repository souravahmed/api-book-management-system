import { BaseEntity } from '@/common/entities/base.entity';
import { Entity, Column } from 'typeorm';

@Entity()
export class Author extends BaseEntity {
  @Column({ type: 'varchar', length: 50 })
  firstName: string;

  @Column({ type: 'varchar', length: 50 })
  lastName: string;

  @Column({ type: 'text', nullable: true })
  bio?: string;

  @Column({ type: 'date', nullable: true })
  birthDate?: Date;
}
