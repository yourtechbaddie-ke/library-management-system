import { ConflictException, Injectable, NotFoundException } from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';
import { CreateBookDto } from './dto/create-book.dto';
import { UpdateBookDto } from './dto/update-book.dto';

@Injectable()
export class BooksService {
  constructor(private prisma: PrismaService) {}

  async create(dto: CreateBookDto) {
    try {
      return await this.prisma.book.create({ data: dto, include: { genre: true } });
    } catch (e) {
      this.handleError(e);
    }
  }

  async findAll(params: { genreId?: number; search?: string; page: number; limit: number }) {
    const { genreId, search, page, limit } = params;

    const where: Prisma.BookWhereInput = {};
    if (genreId) where.genreId = genreId;
    if (search) {
      where.OR = [
        { title: { contains: search, mode: 'insensitive' } },
        { author: { contains: search, mode: 'insensitive' } },
      ];
    }

    const [data, total] = await this.prisma.$transaction([
      this.prisma.book.findMany({
        where,
        skip: (page - 1) * limit,
        take: limit,
        orderBy: { id: 'asc' },
        include: { genre: true },
      }),
      this.prisma.book.count({ where }),
    ]);

    return {
      data,
      meta: { total, page, limit, totalPages: Math.ceil(total / limit) },
    };
  }

  async findOne(id: number) {
    const book = await this.prisma.book.findUnique({ where: { id }, include: { genre: true } });
    if (!book) throw new NotFoundException(`Book ${id} not found`);
    return book;
  }

  async update(id: number, dto: UpdateBookDto) {
    await this.findOne(id);
    try {
      return await this.prisma.book.update({ where: { id }, data: dto, include: { genre: true } });
    } catch (e) {
      this.handleError(e);
    }
  }

  async remove(id: number) {
    await this.findOne(id);
    try {
      return await this.prisma.book.delete({ where: { id } });
    } catch (e) {
      this.handleError(e);
    }
  }

  private handleError(e: unknown): never {
    if (e instanceof Prisma.PrismaClientKnownRequestError) {
      if (e.code === 'P2002') throw new ConflictException('A book with this ISBN already exists');
      if (e.code === 'P2003') throw new NotFoundException('Genre does not exist');
    }
    throw e;
  }
}