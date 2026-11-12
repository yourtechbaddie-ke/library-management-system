import { Controller, Get, Post, Param, Query, Body, ParseIntPipe } from '@nestjs/common';
import { BooksService } from './books.service';
@Controller()
export class BooksController {
  constructor(private readonly books: BooksService) {}
  @Get('books') listBooks(@Query('search') search?: string, @Query('genreId') genreId?: string) { return this.books.listBooks(search, genreId); }
  @Get('books/:id') getBook(@Param('id', ParseIntPipe) id: number) { return this.books.getBook(id); }
  @Post('books') createBook(@Body() body: { title?: string; author?: string; isbn?: string; publishedYear?: number; copies?: number; genreId?: number }) { return this.books.createBook(body); }
  @Get('genres') listGenres() { return this.books.listGenres(); }
}
