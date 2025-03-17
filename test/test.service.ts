import { Injectable } from '@nestjs/common';
import { PrismaService } from '../src/common/prisma.service';
import { Server } from 'http';
import * as request from 'supertest';
import { Book, LoanStatus } from '@prisma/client';

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

  async getStudent(): Promise<{ id: string; nim: string; full_name: string }> {
    const studentData = await this.prismaService.student.findFirst({
      select: {
        id: true,
        nim: true,
        full_name: true,
      },
    });

    if (!studentData) {
      throw new Error('Student not found');
    }

    return studentData;
  }

  async deleteAllBook() {
    await this.prismaService.loan.deleteMany({});
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

  async createBookV3() {
    await this.prismaService.book.create({
      data: {
        title: 'Buku Test 1',
        stock: 2,
      },
    });
  }

  async createBookV4() {
    await this.prismaService.book.create({
      data: {
        title: 'Buku Test 2',
        stock: 2,
      },
    });
  }

  async createBookMass() {
    const books: { title: string; stock: number }[] = [];

    for (let i = 1; i <= 15; i++) {
      books.push({
        title: `Buku Test ${i}`,
        stock: i + 5,
      });
    }

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

  async deleteAllLoans() {
    await this.prismaService.loan.deleteMany({});
  }

  async createLoan() {
    const student = await this.prismaService.student.findFirst();

    if (!student) {
      throw new Error(
        'Student not found, make sure to run prisma:seed:student first',
      );
    }

    const book = await this.getBook();

    if (!book) {
      throw new Error('Book not found, make sure to create a book first');
    }

    await this.prismaService.book.update({
      where: { id: book.id },
      data: { stock: 5 },
    });

    return await this.prismaService.loan.create({
      data: {
        studentId: student.id,
        bookId: book.id,
        status: 'APPROVED',
      },
    });
  }

  async getLoan() {
    const loan = await this.prismaService.loan.findFirst({
      orderBy: {
        createdAt: 'desc',
      },
    });

    if (!loan) {
      throw new Error('Loan not found');
    }

    return loan;
  }

  async updateBookStock(bookId: string, stock: number) {
    return await this.prismaService.book.update({
      where: {
        id: bookId,
      },
      data: {
        stock,
      },
    });
  }

  async createLoanMass() {
    const students = await this.prismaService.student.findMany({
      take: 5,
    });

    if (students.length === 0) {
      throw new Error(
        'No students found, make sure to run prisma:seed:student first',
      );
    }

    const books = await this.prismaService.book.findMany({
      take: 2,
    });

    if (books.length === 0) {
      throw new Error('No books found, make sure to create books first');
    }

    const loans: { studentId: string; bookId: string; status: string }[] = [];
    for (let i = 0; i < 5; i++) {
      const student = students[i % students.length];
      const book = books[i % books.length];

      loans.push({
        studentId: student.id,
        bookId: book.id,
        status: i % 3 === 0 ? 'RETURNED' : 'APPROVED',
      });
    }

    await this.prismaService.$transaction(
      loans.map((loan) =>
        this.prismaService.loan.create({
          data: {
            ...loan,
            status: loan.status as LoanStatus,
          },
        }),
      ),
    );

    return true;
  }
}
