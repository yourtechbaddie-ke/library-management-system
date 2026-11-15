import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';
import { CreateGenreDto } from './dto/create-genre.dto';
import { UpdateGenreDto } from './dto/update-genre.dto';

@Injectable()
export class GenresService {
  constructor(private readonly prisma: PrismaService) {}

  async create(dto: CreateGenreDto) {
    try {
      return await this.prisma.genre.create({ data: { name: dto.name.trim(), description: dto.description?.trim() } });
    } catch (error) {
      if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === 'P2002') {
        throw new BadRequestException('A genre with this name already exists.');
      }
      throw error;
    }
  }

  findAll() {
    return this.prisma.genre.findMany({
      include: { _count: { select: { books: true } } },
      orderBy: { name: 'asc' },
    });
  }

  async findOne(id: number) {
    const genre = await this.prisma.genre.findUnique({ where: { id }, include: { books: true } });
    if (!genre) throw new NotFoundException('Genre not found.');
    return genre;
  }

  async update(id: number, dto: UpdateGenreDto) {
    await this.ensureExists(id);
    try {
      return await this.prisma.genre.update({
        where: { id },
        data: {
          ...(dto.name !== undefined ? { name: dto.name.trim() } : {}),
          ...(dto.description !== undefined ? { description: dto.description?.trim() || null } : {}),
        },
      });
    } catch (error) {
      if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === 'P2002') {
        throw new BadRequestException('A genre with this name already exists.');
      }
      throw error;
    }
  }

  async remove(id: number) {
    await this.ensureExists(id);
    const books = await this.prisma.book.count({ where: { genreId: id } });
    if (books > 0) throw new BadRequestException('Cannot delete a genre while books are assigned to it.');
    return this.prisma.genre.delete({ where: { id } });
  }

  private async ensureExists(id: number) {
    if (!(await this.prisma.genre.findUnique({ where: { id }, select: { id: true } }))) {
      throw new NotFoundException('Genre not found.');
    }
  }
}
