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
  let logger: Logger;
  let httpServer: Server;

  let testService: TestService;
  let token: string;

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule, TestModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    await app.init();

    logger = app.get(WINSTON_MODULE_PROVIDER);
    httpServer = app.getHttpServer() as Server;
    testService = app.get(TestService);

    token = await testService.login(httpServer);
  });

  afterAll(async () => {
    await app.close();
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

      expect(response.status).toBe(409);
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
        .get(`/api/books/${book!.id}`)
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
        .patch(`/api/books/${book!.id}`)
        .set('Authorization', `Bearer ${token}`)
        .send({
          title: 'Buku Cerdas',
        });

      logger.info({ data: response.body as Record<string, string[]> });

      expect(response.status).toBe(200);
      expect(response.body.data.id).toBe(book!.id);
      expect(response.body.data.title).toBe('Buku Cerdas');
      expect(response.body.data.stock).toBe(2);
    });

    it('should be able to update stock only', async () => {
      const book = await testService.getBook();
      const response = await request(httpServer)
        .patch(`/api/books/${book!.id}`)
        .set('Authorization', `Bearer ${token}`)
        .send({
          stock: 4,
        });

      logger.info({ data: response.body as Record<string, string[]> });

      expect(response.status).toBe(200);
      expect(response.body.data.id).toBe(book!.id);
      expect(response.body.data.title).toBe(book!.title);
      expect(response.body.data.stock).toBe(4);
    });

    it('should be able to update title and stock', async () => {
      const book = await testService.getBook();
      const response = await request(httpServer)
        .patch(`/api/books/${book!.id}`)
        .set('Authorization', `Bearer ${token}`)
        .send({
          title: 'Buku Serbaguna',
          stock: 10,
        });

      logger.info({ data: response.body as Record<string, string[]> });

      expect(response.status).toBe(200);
      expect(response.body.data.id).toBe(book!.id);
      expect(response.body.data.title).toBe('Buku Serbaguna');
      expect(response.body.data.stock).toBe(10);
    });

    it('should be rejected if book title already exists', async () => {
      await testService.createBookV2();
      const duplicateBook = await testService.getBook();

      const response = await request(httpServer)
        .patch(`/api/books/${duplicateBook!.id}`)
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

  describe('DELETE /api/books/:id', () => {
    beforeEach(async () => {
      await testService.deleteAllBook();
      await testService.createBook();
    });

    it('should be able to remove book', async () => {
      const book = await testService.getBook();
      const response = await request(httpServer)
        .delete(`/api/books/${book!.id}`)
        .set('Authorization', `Bearer ${token}`);

      logger.info({ data: response.body as Record<string, string[]> });

      expect(response.status).toBe(200);
      expect(response.body.data).toBe(true);
    });

    it('should be rejected if book does not exist', async () => {
      const invalidUuid = '201dfe0a-adf3-442e-8c69-c709bd7aec14';
      const response = await request(httpServer)
        .delete(`/api/books/${invalidUuid}`)
        .set('Authorization', `Bearer ${token}`);

      logger.info({ data: response.body as Record<string, string[]> });

      expect(response.status).toBe(404);
      expect(response.body.errors).toBeDefined();
    });
  });

  describe('GET /api/books', () => {
    beforeEach(async () => {
      await testService.deleteAllBook();
    });

    it('should be able to get list of books', async () => {
      await testService.createBook();
      await testService.createBookV2();

      const response = await request(httpServer)
        .get('/api/books')
        .set('Authorization', `Bearer ${token}`);

      logger.info({ data: response.body as Record<string, string[]> });

      expect(response.status).toBe(200);
      expect(response.body.data).toBeInstanceOf(Array);
      expect(response.body.data.length).toBe(2);

      expect(response.body.data[0].title).toBe('Buku AI');
      expect(response.body.data[1].title).toBe('Buku Code');
    });

    it('should be able if no books are found', async () => {
      const response = await request(httpServer)
        .get('/api/books')
        .set('Authorization', `Bearer ${token}`);

      logger.info({ data: response.body as Record<string, string[]> });

      expect(response.status).toBe(200);
      expect(response.body.data).toBeDefined();
    });
  });

  describe('GET /api/books', () => {
    beforeEach(async () => {
      await testService.deleteAllBook();
    });

    it('should be able to search books by id', async () => {
      await testService.createBook();
      const book = await testService.getBook();
      const response = await request(httpServer)
        .get(`/api/books/search`)
        .query({
          id: `${book!.id}`,
        })
        .set('Authorization', `Bearer ${token}`);

      logger.info({ data: response.body as Record<string, string[]> });

      expect(response.status).toBe(200);
      expect(response.body.data.length).toBe(1);
    });

    it('should be able to search books by id not found', async () => {
      await testService.createBookV2();
      const invalidUuid = '1a9ddd5c-4ed7-41ef-ba35-a862e2cedd05';
      const response = await request(httpServer)
        .get(`/api/books/search`)
        .query({
          id: invalidUuid,
        })
        .set('Authorization', `Bearer ${token}`);

      logger.info({ data: response.body as Record<string, string[]> });

      expect(response.status).toBe(200);
      expect(response.body.data.length).toBe(0);
    });

    it('should be able to search books by title', async () => {
      await testService.createBookV2();
      const response = await request(httpServer)
        .get(`/api/books/search`)
        .query({
          title: 'Code',
        })
        .set('Authorization', `Bearer ${token}`);

      logger.info({ data: response.body as Record<string, string[]> });

      expect(response.status).toBe(200);
      expect(response.body.data.length).toBe(1);
    });

    it('should be able to search books by title not found', async () => {
      await testService.createBookV2();
      const response = await request(httpServer)
        .get(`/api/books/search`)
        .query({
          title: '205410079',
        })
        .set('Authorization', `Bearer ${token}`);

      logger.info({ data: response.body as Record<string, string[]> });

      expect(response.status).toBe(200);
      expect(response.body.data.length).toBe(0);
    });

    it('should be able to search books with page', async () => {
      await testService.createBookMass();
      const response = await request(httpServer)
        .get(`/api/books/search`)
        .query({
          size: 1,
          page: 2,
        })
        .set('Authorization', `Bearer ${token}`);

      logger.info({ data: response.body as Record<string, string[]> });

      expect(response.status).toBe(200);
      expect(response.body.data.length).toBe(1);
      expect(response.body.paging.current_page).toBe(2);
      expect(response.body.paging.total_page).toBe(15);
      expect(response.body.paging.size).toBe(1);
    });

    it('should be able to search books with page v2', async () => {
      await testService.createBookMass();
      const response = await request(httpServer)
        .get(`/api/books/search`)
        .query({
          size: 8,
          page: 2,
        })
        .set('Authorization', `Bearer ${token}`);

      logger.info({ data: response.body as Record<string, string[]> });

      expect(response.status).toBe(200);
      expect(response.body.data.length).toBe(7);
      expect(response.body.paging.current_page).toBe(2);
      expect(response.body.paging.total_page).toBe(2);
      expect(response.body.paging.size).toBe(8);
    });

    it('should use default pagination when not provided', async () => {
      await testService.createBookMass();
      const response = await request(httpServer)
        .get('/api/books/search')
        .set('Authorization', `Bearer ${token}`);

      logger.info({ data: response.body as Record<string, string[]> });

      expect(response.status).toBe(200);
      expect(response.body.paging.current_page).toBe(1);
      expect(response.body.paging.size).toBe(10);
    });
  });
});
