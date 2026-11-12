import { Injectable, BadRequestException, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
@Injectable()
export class BooksService {
  constructor(private readonly prisma: PrismaService) {}
  listBooks(search?: string, genreId?: string) {
    return this.prisma.book.findMany({
      where: {
        ...(search ? { OR: [
          { title: { contains: search, mode: 'insensitive' } },
          { author: { contains: search, mode: 'insensitive' } },
          { isbn: { contains: search, mode: 'insensitive' } },
        ] } : {}),
        ...(genreId && Number.isInteger(Number(genreId)) ? { genreId: Number(genreId) } : {}),
      },
      include: { genre: true, reviews: true }, orderBy: { title: 'asc' },
    });
  }
  listGenres() { return this.prisma.genre.findMany({ include: { _count: { select: { books: true } } }, orderBy: { name: 'asc' } }); }
  async createBook(input: { title?: string; author?: string; isbn?: string; publishedYear?: number; copies?: number; genreId?: number }) {
    if (!input.title?.trim() || !input.author?.trim() || !input.isbn?.trim() || !Number.isInteger(input.publishedYear) || !Number.isInteger(input.genreId)) throw new BadRequestException('title, author, isbn, publishedYear and genreId are required.');
    if (!await this.prisma.genre.findUnique({ where: { id: input.genreId } })) throw new BadRequestException('The selected genre does not exist.');
    try {
      return await this.prisma.book.create({ data: { title: input.title.trim(), author: input.author.trim(), isbn: input.isbn.trim(), publishedYear: input.publishedYear!, copies: Number.isInteger(input.copies) && input.copies! >= 0 ? input.copies! : 1, genreId: input.genreId! }, include: { genre: true } });
    } catch (error: any) { if (error?.code === 'P2002') throw new BadRequestException('A book with this ISBN already exists.'); throw error; }
  }
  async getBook(id: number) {
    const book = await this.prisma.book.findUnique({ where: { id }, include: { genre: true, reviews: { include: { user: true } } } });
    if (!book) throw new NotFoundException('Book not found.');
    return book;
  }
}
