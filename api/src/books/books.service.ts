import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';
import { CreateBookDto } from './dto/create-book.dto';
import { UpdateBookDto } from './dto/update-book.dto';

type BookQuery = { genreId?: string; search?: string; page?: string; limit?: string };

@Injectable()
export class BooksService {
  constructor(private readonly prisma: PrismaService) {}

  async findAll(query: BookQuery) {
    const page = this.parsePositiveInteger(query.page, 1, 'page');
    const limit = Math.min(this.parsePositiveInteger(query.limit, 10, 'limit'), 100);
    const genreId = query.genreId ? this.parsePositiveInteger(query.genreId, 1, 'genreId') : undefined;

    const where: Prisma.BookWhereInput = {
      ...(genreId !== undefined ? { genreId } : {}),
      ...(query.search?.trim() ? {
        OR: [
          { title: { contains: query.search.trim(), mode: 'insensitive' } },
          { author: { contains: query.search.trim(), mode: 'insensitive' } },
        ],
      } : {}),
    };

    const [data, total] = await this.prisma.$transaction([
      this.prisma.book.findMany({
        where,
        include: { genre: true },
        orderBy: { title: 'asc' },
        skip: (page - 1) * limit,
        take: limit,
      }),
      this.prisma.book.count({ where }),
    ]);

    return { data, pagination: { page, limit, total, totalPages: Math.ceil(total / limit) } };
  }

  async findOne(id: number) {
    const book = await this.prisma.book.findUnique({
      where: { id },
      include: { genre: true, reviews: { include: { user: { select: { id: true, name: true } } } } },
    });
    if (!book) throw new NotFoundException('Book not found.');
    return book;
  }

  async create(dto: CreateBookDto) {
    await this.ensureGenreExists(dto.genreId);
    try {
      return await this.prisma.book.create({
        data: {
          title: dto.title.trim(),
          author: dto.author.trim(),
          isbn: dto.isbn.trim(),
          copies: dto.totalCopies,
          publishedYear: dto.publishedYear ?? new Date().getFullYear(),
          genreId: dto.genreId,
        },
        include: { genre: true },
      });
    } catch (error) {
      if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === 'P2002') {
        throw new BadRequestException('A book with this ISBN already exists.');
      }
      throw error;
    }
  }

  async update(id: number, dto: UpdateBookDto) {
    await this.findOne(id);
    if (dto.genreId !== undefined) await this.ensureGenreExists(dto.genreId);
    try {
      return await this.prisma.book.update({
        where: { id },
        data: {
          ...(dto.title !== undefined ? { title: dto.title.trim() } : {}),
          ...(dto.author !== undefined ? { author: dto.author.trim() } : {}),
          ...(dto.isbn !== undefined ? { isbn: dto.isbn.trim() } : {}),
          ...(dto.totalCopies !== undefined ? { copies: dto.totalCopies } : {}),
          ...(dto.publishedYear !== undefined ? { publishedYear: dto.publishedYear } : {}),
          ...(dto.genreId !== undefined ? { genreId: dto.genreId } : {}),
        },
        include: { genre: true },
      });
    } catch (error) {
      if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === 'P2002') {
        throw new BadRequestException('A book with this ISBN already exists.');
      }
      throw error;
    }
  }

  async remove(id: number) {
    await this.findOne(id);
    return this.prisma.book.delete({ where: { id } });
  }

  private async ensureGenreExists(id: number) {
    if (!(await this.prisma.genre.findUnique({ where: { id }, select: { id: true } }))) {
      throw new BadRequestException('The selected genre does not exist.');
    }
  }

  private parsePositiveInteger(value: string | undefined, fallback: number, field: string) {
    if (value === undefined || value === '') return fallback;
    const parsed = Number(value);
    if (!Number.isSafeInteger(parsed) || parsed < 1) {
      throw new BadRequestException(`${field} must be a positive integer.`);
    }
    return parsed;
  }
}
