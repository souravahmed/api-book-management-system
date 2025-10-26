import { IsDateString, IsISBN, IsOptional, IsString } from 'class-validator';

export class UpdateBookDto {
  @IsOptional()
  @IsString()
  title?: string;

  @IsOptional()
  @IsString()
  @IsISBN()
  isbn?: string;

  @IsOptional()
  @IsString()
  @IsDateString()
  publishedDate?: string;

  @IsOptional()
  @IsString()
  genre?: string;
}
