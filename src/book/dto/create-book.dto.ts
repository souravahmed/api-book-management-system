import {
  IsDateString,
  IsISBN,
  IsNotEmpty,
  IsOptional,
  IsString,
} from 'class-validator';

export class CreateBookDto {
  @IsString()
  @IsNotEmpty()
  title: string;

  @IsString()
  @IsNotEmpty()
  @IsISBN()
  isbn: string;

  @IsOptional()
  @IsString()
  @IsDateString()
  publishedDate?: string;

  @IsOptional()
  @IsString()
  genre?: string;

  @IsNotEmpty()
  @IsString()
  authorId: string;
}
