import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import * as request from 'supertest';
import { AppModule } from '../src/app.module';
import { WINSTON_MODULE_PROVIDER } from 'nest-winston';
import { Logger } from 'winston';
import { Server } from 'http';
import { TestService } from './test.service';
import { TestModule } from './test.module';

describe('BookController', () => {
  let app: INestApplication;
  let logger: Logger; // Gunakan tipe Logger dari winston
  let httpServer: Server; // Tambahkan variabel untuk menyimpan HTTP server

  let testService: TestService;

  beforeEach(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule, TestModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    await app.init();

    // Ambil logger dari nest-winston
    logger = app.get(WINSTON_MODULE_PROVIDER);

    // Ambil HTTP server dengan tipe yang jelas
    httpServer = app.getHttpServer() as Server;

    testService = app.get(TestService);
  });

  let token: string;

  beforeEach(async () => {
    token = await testService.login(httpServer);
  });

  describe('POST /api/books', () => {
    beforeEach(async () => {
      await testService.deleteAllBook();
    });

    it('should be rejected if request is invalid', async () => {
      const response = await request(httpServer)
        .post('/api/books')
        .set('Authorization', `Bearer ${token}`)
        .send({
          title: 3,
          stock: 'abc',
        });

      logger.info({ data: response.body as Record<string, string[]> });

      expect(response.status).toBe(400);
      expect(response.body.errors).toBeDefined();
    });

    it('should be able to create book', async () => {
      const response = await request(httpServer)
        .post('/api/books')
        .set('Authorization', `Bearer ${token}`)
        .send({
          title: 'Buku AI',
          stock: 2,
        });

      logger.info({ data: response.body as Record<string, string[]> });

      expect(response.status).toBe(201);
      expect(response.body.data.id).toBeDefined();
      expect(response.body.data.title).toBe('Buku AI');
      expect(response.body.data.stock).toBe(2);
    });

    it('should be rejected if book title already exists', async () => {
      await testService.createBook();
      const response = await request(httpServer)
        .post('/api/books')
        .set('Authorization', `Bearer ${token}`)
        .send({
          title: 'Buku AI',
          stock: 6,
        });

      logger.info({ data: response.body as Record<string, string[]> });

      expect(response.status).toBe(409); // CONFLICT
      expect(response.body.errors).toBeDefined();
    });
  });

  describe('GET /api/books/:id', () => {
    beforeEach(async () => {
      await testService.deleteAllBook();
      await testService.createBook();
    });

    it('should be rejected if book is not found', async () => {
      const invalidUuid = '1a9ddd5c-4ed7-41ef-ba35-a862e2cedd05';
      const response = await request(httpServer)
        .get(`/api/books/${invalidUuid}`)
        .set('Authorization', `Bearer ${token}`);

      logger.info({ data: response.body as Record<string, string[]> });

      expect(response.status).toBe(404);
      expect(response.body.errors).toBeDefined();
    });

    it('should be able to get book', async () => {
      const book = await testService.getBook();
      const response = await request(httpServer)
        .get(`/api/books/${book.id}`)
        .set('Authorization', `Bearer ${token}`);

      logger.info({ data: response.body as Record<string, string[]> });

      expect(response.status).toBe(200);
      expect(response.body.data.id).toBeDefined();
      expect(response.body.data.title).toBe('Buku AI');
      expect(response.body.data.stock).toBe(2);
    });
  });

  describe('PATCH /api/books/:id', () => {
    beforeEach(async () => {
      await testService.deleteAllBook();
      await testService.createBook();
    });

    it('should be able to update title only', async () => {
      const book = await testService.getBook();
      const response = await request(httpServer)
        .patch(`/api/books/${book.id}`)
        .set('Authorization', `Bearer ${token}`)
        .send({
          title: 'Buku Cerdas',
        });

      logger.info({ data: response.body as Record<string, string[]> });

      expect(response.status).toBe(200);
      expect(response.body.data.id).toBe(book.id);
      expect(response.body.data.title).toBe('Buku Cerdas');
      expect(response.body.data.stock).toBe(2);
    });

    it('should be able to update stock only', async () => {
      const book = await testService.getBook();
      const response = await request(httpServer)
        .patch(`/api/books/${book.id}`)
        .set('Authorization', `Bearer ${token}`)
        .send({
          stock: 4,
        });

      logger.info({ data: response.body as Record<string, string[]> });

      expect(response.status).toBe(200);
      expect(response.body.data.id).toBe(book.id);
      expect(response.body.data.title).toBe(book.title);
      expect(response.body.data.stock).toBe(4);
    });

    it('should be able to update title and stock', async () => {
      const book = await testService.getBook();
      const response = await request(httpServer)
        .patch(`/api/books/${book.id}`)
        .set('Authorization', `Bearer ${token}`)
        .send({
          title: 'Buku Serbaguna',
          stock: 10,
        });

      logger.info({ data: response.body as Record<string, string[]> });

      expect(response.status).toBe(200);
      expect(response.body.data.id).toBe(book.id);
      expect(response.body.data.title).toBe('Buku Serbaguna');
      expect(response.body.data.stock).toBe(10);
    });

    it('should be rejected if book title already exists', async () => {
      await testService.createBookV2();
      const duplicateBook = await testService.getBook();

      const response = await request(httpServer)
        .patch(`/api/books/${duplicateBook.id}`)
        .set('Authorization', `Bearer ${token}`)
        .send({
          title: 'Buku Code',
          stock: 5,
        });

      logger.info({ data: response.body as Record<string, string[]> });

      expect(response.status).toBe(409);
    });

    it('should be rejected if book does not exist', async () => {
      const invalidUuid = '201dfe0a-adf3-442e-8c69-c709bd7aec14';
      const response = await request(httpServer)
        .patch(`/api/books/${invalidUuid}`)
        .set('Authorization', `Bearer ${token}`)
        .send({
          title: 'Buku Baru',
          stock: 3,
        });

      logger.info({ data: response.body as Record<string, string[]> });

      expect(response.status).toBe(404);
    });
  });

  // describe('GET /api/student/:id', () => {
  //   it('should be rejected if student is not found', async () => {
  //     // Using an invalid UUID that doesn't exist in the system
  //     const invalidUuid = '201dfe0a-adf3-442e-8c69-c709bd7aec14';

  //     const response = await request(httpServer)
  //       .get(`/api/student/${invalidUuid}`)
  //       .set('Authorization', `Bearer ${token}`);

  //     logger.info({ data: response.body as Record<string, string[]> });

  //     expect(response.status).toBe(404);
  //     expect(response.body.errors).toBeDefined();
  //   });

  //   it('should be able to get student', async () => {
  //     const student = await testService.getUser();
  //     const response = await request(httpServer)
  //       .get(`/api/student/${student.id}`)
  //       .set('Authorization', `Bearer ${token}`);

  //     logger.info({ data: response.body as Record<string, string[]> });

  //     expect(response.status).toBe(200);
  //     expect(response.body.data.id).toBeDefined();
  //     expect(response.body.data.full_name).toBe('Ahmad Rifai');
  //     expect(response.body.data.nim).toBe('205410080');
  //   });
  // });

  // describe('GET /api/student', () => {
  //   it('should be able to get list student', async () => {
  //     const response = await request(httpServer)
  //       .get('/api/student/')
  //       .set('Authorization', `Bearer ${token}`);

  //     logger.info({ data: response.body as Record<string, string[]> });

  //     expect(response.status).toBe(200);
  //     expect(response.body.data.length).toBe(15);
  //   });

  //   it('should be able to search student by full_name', async () => {
  //     const response = await request(httpServer)
  //       .get(`/api/student/search`)
  //       .query({
  //         full_name: 'ah',
  //       })
  //       .set('Authorization', `Bearer ${token}`);

  //     logger.info({ data: response.body as Record<string, string[]> });

  //     expect(response.status).toBe(200);
  //     expect(response.body.data.length).toBe(3);
  //   });

  //   it('should be able to search student by full_name not found', async () => {
  //     const response = await request(httpServer)
  //       .get(`/api/student/search`)
  //       .query({
  //         full_name: 'wrong',
  //       })
  //       .set('Authorization', `Bearer ${token}`);

  //     logger.info({ data: response.body as Record<string, string[]> });

  //     expect(response.status).toBe(200);
  //     expect(response.body.data.length).toBe(0);
  //   });

  //   it('should be able to search student by nim', async () => {
  //     const response = await request(httpServer)
  //       .get(`/api/student/search`)
  //       .query({
  //         nim: '205410084',
  //       })
  //       .set('Authorization', `Bearer ${token}`);

  //     logger.info({ data: response.body as Record<string, string[]> });

  //     expect(response.status).toBe(200);
  //     expect(response.body.data.length).toBe(1);
  //   });

  //   it('should be able to search student by nim not found', async () => {
  //     const response = await request(httpServer)
  //       .get(`/api/student/search`)
  //       .query({
  //         nim: '205410079',
  //       })
  //       .set('Authorization', `Bearer ${token}`);

  //     logger.info({ data: response.body as Record<string, string[]> });

  //     expect(response.status).toBe(200);
  //     expect(response.body.data.length).toBe(0);
  //   });

  //   it('should be able to search student with page', async () => {
  //     const response = await request(httpServer)
  //       .get(`/api/student/search`)
  //       .query({
  //         size: 1,
  //         page: 2,
  //       })
  //       .set('Authorization', `Bearer ${token}`);

  //     logger.info({ data: response.body as Record<string, string[]> });

  //     expect(response.status).toBe(200);
  //     expect(response.body.data.length).toBe(1);
  //     expect(response.body.paging.current_page).toBe(2);
  //     expect(response.body.paging.total_page).toBe(15);
  //     expect(response.body.paging.size).toBe(1);
  //   });

  //   it('should be able to search student with page v2', async () => {
  //     const response = await request(httpServer)
  //       .get(`/api/student/search`)
  //       .query({
  //         size: 8,
  //         page: 2,
  //       })
  //       .set('Authorization', `Bearer ${token}`);

  //     logger.info({ data: response.body as Record<string, string[]> });

  //     expect(response.status).toBe(200);
  //     expect(response.body.data.length).toBe(7);
  //     expect(response.body.paging.current_page).toBe(2);
  //     expect(response.body.paging.total_page).toBe(2);
  //     expect(response.body.paging.size).toBe(8);
  //   });

  //   it('should use default pagination when not provided', async () => {
  //     const response = await request(httpServer)
  //       .get('/api/student/search')
  //       .set('Authorization', `Bearer ${token}`);

  //     logger.info({ data: response.body as Record<string, string[]> });

  //     expect(response.status).toBe(200);
  //     expect(response.body.paging.current_page).toBe(1);
  //     expect(response.body.paging.size).toBe(10);
  //   });
  // });
});
