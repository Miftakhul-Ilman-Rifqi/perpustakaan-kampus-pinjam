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
      .post('/api/superadmin/login')
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

  async getBook(): Promise<Book> {
    const book = await this.prismaService.book.findUnique({
      where: {
        title: 'Buku AI',
      },
    });

    if (!book) {
      throw new Error('book not found');
    }

    return book;
  }

  //   async deleteAll() {
  //     await this.deleteAddress();
  //     await this.deleteContact();
  //     await this.deleteUser();
  //   }

  // async deleteSuperadmin() {
  //   await this.prismaService.superadmin.deleteMany({
  //     where: {
  //       username: 'rif123',
  //     },
  //   });
  // }

  //   async deleteContact() {
  //     await this.prismaService.contact.deleteMany({
  //       where: {
  //         username: 'test',
  //       },
  //     });
  //   }

  //   async getUser(): Promise<User> {
  //     const user = await this.prismaService.user.findUnique({
  //       where: {
  //         username: 'test',
  //       },
  //     });

  //     if (!user) {
  //       throw new Error('User not found');
  //     }

  //     return user;
  //   }

  // async createUser() {
  //   await this.prismaService.superadmin.create({
  //     data: {
  //       username: 'test',
  //       full_name: 'test',
  //       password: await bcrypt.hash('test', 10),
  //       token: 'test',
  //     },
  //   });
  // }

  //   async getContact(): Promise<Contact> {
  //     const contact = await this.prismaService.contact.findFirst({
  //       where: {
  //         username: 'test',
  //       },
  //     });

  //     if (!contact) {
  //       throw new Error('Contact not found');
  //     }

  //     return contact;
  //   }

  //   async createContact() {
  //     await this.prismaService.contact.create({
  //       data: {
  //         first_name: 'test',
  //         last_name: 'test',
  //         email: 'test@example.com',
  //         phone: '9999',
  //         username: 'test',
  //       },
  //     });
  //   }

  //   async deleteAddress() {
  //     await this.prismaService.address.deleteMany({
  //       where: {
  //         contact: {
  //           username: 'test',
  //         },
  //       },
  //     });
  //   }

  //   async createAddress() {
  //     const contact = await this.getContact();
  //     await this.prismaService.address.create({
  //       data: {
  //         contact_id: contact.id,
  //         street: 'jalan test',
  //         city: 'kota test',
  //         province: 'provinsi test',
  //         country: 'negara test',
  //         postal_code: '1111',
  //       },
  //     });
  //   }

  //   async getAddress(): Promise<Address | null> {
  //     return this.prismaService.address.findFirst({
  //       where: {
  //         contact: {
  //           username: 'test',
  //         },
  //       },
  //     });
  //   }

  // ----
  // async getAddress(): Promise<Address> {
  //   const contact = await this.prismaService.address.findFirst({
  //     where: {
  //       contact: {
  //         username: 'test',
  //       },
  //     },
  //   });

  //   if (!contact) {
  //     throw new Error('Contact not found');
  //   }

  //   return contact;
  // }
}
