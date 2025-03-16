import { Injectable } from '@nestjs/common';
import { PrismaService } from '../src/common/prisma.service';
import { Server } from 'http';
import * as request from 'supertest';
import { Book } from '@prisma/client';

@Injectable()
export class TestService {
  constructor(private prismaService: PrismaService) {}

  async login(httpServer: Server): Promise<string> {
    const loginResponse = await request(httpServer)
      .post('/api/superadmins/login')
      .send({
        username: 'rif123',
        password: 'perpuskampis',
      });
    return loginResponse.body.data.token as string;
  }

  async getUser(): Promise<{ id: string }> {
    const student = await this.prismaService.student.findFirst({
      select: {
        id: true,
      },
    });

    if (!student) {
      throw new Error('Student not found');
    }

    return student;
  }

  async deleteAllBook() {
    await this.prismaService.book.deleteMany({});
  }

  async createBook() {
    await this.prismaService.book.create({
      data: {
        title: 'Buku AI',
        stock: 2,
      },
    });
  }

  async getBook(): Promise<Book | null> {
    const book = await this.prismaService.book.findUnique({
      where: {
        title: 'Buku AI',
      },
    });

    if (!book) {
      throw new Error('book not found');
    }

    return book ?? null;
  }

  async createBookV2() {
    await this.prismaService.book.create({
      data: {
        title: 'Buku Code',
        stock: 2,
      },
    });
  }

  async getBookV2(): Promise<Book> {
    const book = await this.prismaService.book.findUnique({
      where: {
        title: 'Buku Code',
      },
    });

    if (!book) {
      throw new Error('book not found');
    }

    return book;
  }

  async createBookMass() {
    const books: { title: string; stock: number }[] = [];

    for (let i = 1; i <= 15; i++) {
      books.push({
        title: `Buku Test ${i}`,
        stock: i + 5,
      });
    }

    // Create books in a transaction to prevent conflicts
    await this.prismaService.$transaction(
      books.map((book) =>
        this.prismaService.book.create({
          data: {
            title: book.title,
            stock: book.stock,
          },
        }),
      ),
    );

    return true;
  }
}
