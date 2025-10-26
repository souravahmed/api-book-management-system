import { IsNotEmpty, IsOptional, IsString, Matches } from 'class-validator';

export class UpdateBookDto {
  @IsOptional()
  @IsString()
  @IsNotEmpty()
  title?: string;

  @IsOptional()
  @IsString()
  @IsNotEmpty()
  @Matches(/^(97(8|9)[-\s]?)?\d{1,5}[-\s]?\d{1,7}[-\s]?\d{1,7}[-\s]?[\dX]$/, {
    message:
      'isbn must be a valid ISBN-10 or ISBN-13 format (e.g., 978-3-16-148410-0 or 0-306-40615-2)',
  })
  isbn?: string;

  @IsOptional()
  @IsString()
  @Matches(/^\d{4}-\d{2}-\d{2}$/, {
    message: 'publishedDate must be in YYYY-MM-DD format',
  })
  publishedDate?: string;

  @IsOptional()
  @IsString()
  genre?: string;
}
