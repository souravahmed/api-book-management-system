import {
  IsOptional,
  IsString,
  MaxLength,
  IsDateString,
  Matches,
} from 'class-validator';

export class UpdateAuthorDto {
  @IsOptional()
  @IsString()
  @MaxLength(50)
  firstName?: string;

  @IsOptional()
  @IsString()
  @MaxLength(50)
  lastName?: string;

  @IsOptional()
  @IsString()
  bio?: string;

  @IsOptional()
  @IsDateString()
  @Matches(/^\d{4}-\d{2}-\d{2}$/, {
    message: 'birthDate must be in YYYY-MM-DD format',
  })
  birthDate?: string;
}
