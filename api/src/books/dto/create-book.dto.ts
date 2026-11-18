import { Type } from 'class-transformer';
import { IsInt, IsNotEmpty, IsString, Matches, MaxLength, Min } from 'class-validator';

export class CreateBookDto {
  @IsString()
  @IsNotEmpty()
  @MaxLength(255)
  title: string;

  @IsString()
  @IsNotEmpty()
  @MaxLength(255)
  author: string;

  // ISBN-10 or ISBN-13, hyphens/spaces allowed
  @IsString()
  @Matches(/^(?:\d[- ]?){9}[\dXx]$|^(?:\d[- ]?){13}$/, {
    message: 'isbn must be a valid ISBN-10 or ISBN-13',
  })
  isbn: string;

  @Type(() => Number)
  @IsInt()
  @Min(1)
  totalCopies: number;

  @Type(() => Number)
  @IsInt()
  @Min(1)
  genreId: number;
}