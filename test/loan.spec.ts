import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import * as request from 'supertest';
import { AppModule } from '../src/app.module';
import { WINSTON_MODULE_PROVIDER } from 'nest-winston';
import { Logger } from 'winston';
import { Server } from 'http';
import { TestService } from './test.service';
import { TestModule } from './test.module';
import { LoanStatus } from '@prisma/client';

describe('LoanController', () => {
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
    await testService.deleteAllLoans();
    await testService.deleteAllBook();
  });

  afterAll(async () => {
    await testService.deleteAllLoans();
    await testService.deleteAllBook();
    await app.close();
  });

  describe('POST /api/loans', () => {
    beforeEach(async () => {
      await testService.deleteAllLoans();
      await testService.deleteAllBook();
      await testService.createBook();
    });

    it('should be rejected if request is invalid', async () => {
      logger.info('should be rejected if request is invalid START');
      const response = await request(httpServer)
        .post('/api/loans')
        .set('Authorization', `Bearer ${token}`)
        .send({
          nim: '',
          bookId: 'invalid-id',
        });
      logger.info({ data: response.body as Record<string, string[]> });
      expect(response.status).toBe(400);
      expect(response.body.errors).toBeDefined();
    });

    it('should be able to create loan', async () => {
      logger.info('should be able to create loan START');
      const studentData = await testService.getStudent();
      const book = await testService.getBook();
      const response = await request(httpServer)
        .post('/api/loans')
        .set('Authorization', `Bearer ${token}`)
        .send({
          nim: studentData?.nim,
          bookId: book!.id,
        });
      logger.info({ data: response.body as Record<string, string[]> });
      expect(response.status).toBe(201);
      expect(response.body.data.id).toBeDefined();
      expect(response.body.data.nim).toBe(studentData?.nim);
      expect(response.body.data.status).toBe('APPROVED');
    });

    it('should be rejected if book out of stock', async () => {
      logger.info('should be rejected if book out of stock START');
      const studentData = await testService.getStudent();
      const book = await testService.getBook();
      // Update book to have 0 stock
      await testService.updateBookStock(book!.id, 0);
      // Try to create loan with book that has 0 stock
      const response = await request(httpServer)
        .post('/api/loans')
        .set('Authorization', `Bearer ${token}`)
        .send({
          nim: studentData?.nim,
          bookId: book!.id,
        });
      logger.info({ data: response.body as Record<string, string[]> });
      expect(response.status).toBe(400);
      expect(response.body.errors).toBe('Book out of stock');
    });

    it('should be rejected if student has pending loans', async () => {
      logger.info('should be rejected if student has pending loans START');
      const studentData = await testService.getStudent();
      const book = await testService.getBook();
      await testService.createBookV2();
      const bookV2 = await testService.getBookV2();
      // First loan
      await request(httpServer)
        .post('/api/loans')
        .set('Authorization', `Bearer ${token}`)
        .send({
          nim: studentData?.nim,
          bookId: book!.id,
        });
      // Try another loan for same student
      const response = await request(httpServer)
        .post('/api/loans')
        .set('Authorization', `Bearer ${token}`)
        .send({
          nim: studentData?.nim,
          bookId: bookV2.id,
        });
      logger.info({ data: response.body as Record<string, string[]> });
      expect(response.status).toBe(400);
      expect(response.body.errors).toBe('Student has pending loans');
    });
  });

  describe('GET /api/loans/:id', () => {
    beforeEach(async () => {
      await testService.deleteAllLoans();
      await testService.deleteAllBook();
      await testService.createBook();
      await testService.createLoan();
    });

    it('should be rejected if loan is not found', async () => {
      logger.info('should be rejected if loan is not found START');
      const invalidUuid = '1a9ddd5c-4ed7-41ef-ba35-a862e2cedd05';
      const response = await request(httpServer)
        .get(`/api/loans/${invalidUuid}`)
        .set('Authorization', `Bearer ${token}`);
      logger.info({ data: response.body as Record<string, string[]> });
      expect(response.status).toBe(404);
      expect(response.body.errors).toBeDefined();
    });

    it('should be able to get loan', async () => {
      logger.info('should be able to get loan START');
      const loan = await testService.getLoan();
      const response = await request(httpServer)
        .get(`/api/loans/${loan.id}`)
        .set('Authorization', `Bearer ${token}`);
      logger.info({ data: response.body as Record<string, string[]> });
      expect(response.status).toBe(200);
      expect(response.body.data.id).toBeDefined();
      expect(response.body.data.nim).toBeDefined();
      expect(response.body.data.full_name).toBeDefined();
      expect(response.body.data.title).toBeDefined();
      expect(response.body.data.status).toBe('APPROVED');
    });
  });

  describe('PATCH /api/loans/:id', () => {
    beforeEach(async () => {
      await testService.deleteAllLoans();
      await testService.deleteAllBook();
      await testService.createBook();
      await testService.createLoan();
    });

    it('should be able to update loan status to RETURNED', async () => {
      logger.info('should be able to update loan status to RETURNED START');
      const loan = await testService.getLoan();
      const response = await request(httpServer)
        .patch(`/api/loans/${loan.id}`)
        .set('Authorization', `Bearer ${token}`)
        .send({
          status: 'RETURNED',
        });
      logger.info({ data: response.body as Record<string, string[]> });
      expect(response.status).toBe(200);
      expect(response.body.data.id).toBe(loan.id);
      expect(response.body.data.status).toBe('RETURNED');
    });

    it('should be rejected if invalid status transition', async () => {
      logger.info('should be rejected if invalid status transition START');
      const loan = await testService.getLoan();
      // First set to RETURNED
      await request(httpServer)
        .patch(`/api/loans/${loan.id}`)
        .set('Authorization', `Bearer ${token}`)
        .send({
          status: 'RETURNED',
        });
      // Try to update again
      const response = await request(httpServer)
        .patch(`/api/loans/${loan.id}`)
        .set('Authorization', `Bearer ${token}`)
        .send({
          status: 'APPROVED',
        });
      logger.info({ data: response.body as Record<string, string[]> });
      expect(response.status).toBe(400);
      expect(response.body.errors).toBe('Invalid status transition');
    });

    it('should be rejected if loan not found', async () => {
      logger.info('should be rejected if loan not found START');
      const invalidUuid = '201dfe0a-adf3-442e-8c69-c709bd7aec14';
      const response = await request(httpServer)
        .patch(`/api/loans/${invalidUuid}`)
        .set('Authorization', `Bearer ${token}`)
        .send({
          status: 'RETURNED',
        });
      logger.info({ data: response.body as Record<string, string[]> });
      expect(response.status).toBe(404);
      expect(response.body.errors).toBeDefined();
    });
  });

  describe('DELETE /api/loans/:id', () => {
    beforeEach(async () => {
      await testService.deleteAllLoans();
      await testService.deleteAllBook();
      await testService.createBook();
      await testService.createLoan();
    });

    it('should be able to remove loan', async () => {
      logger.info('should be able to remove loan START');
      const loan = await testService.getLoan();
      const response = await request(httpServer)
        .delete(`/api/loans/${loan.id}`)
        .set('Authorization', `Bearer ${token}`);
      logger.info({ data: response.body as Record<string, string[]> });
      expect(response.status).toBe(200);
      expect(response.body.data).toBe(true);
    });

    it('should be rejected if loan is not found', async () => {
      logger.info('should be rejected if loan is not found START');
      const invalidUuid = '201dfe0a-adf3-442e-8c69-c709bd7aec14';
      const response = await request(httpServer)
        .delete(`/api/loans/${invalidUuid}`)
        .set('Authorization', `Bearer ${token}`);
      logger.info({ data: response.body as Record<string, string[]> });
      expect(response.status).toBe(404);
      expect(response.body.errors).toBeDefined();
    });
  });

  describe('GET /api/loans', () => {
    beforeEach(async () => {
      await testService.deleteAllLoans();
      await testService.deleteAllBook();
      await testService.createBook();
      await testService.createBookV2();
      await testService.createLoan();
    });

    it('should be able to get list of loans', async () => {
      logger.info('should be able to get list of loans START');
      const response = await request(httpServer)
        .get('/api/loans')
        .set('Authorization', `Bearer ${token}`);
      logger.info({ data: response.body as Record<string, string[]> });
      expect(response.status).toBe(200);
      expect(response.body.data).toBeInstanceOf(Array);
      expect(response.body.data.length).toBeGreaterThan(0);
    });

    it('should return 200 if no loans are found', async () => {
      logger.info('should return 200 if no loans are found START');
      await testService.deleteAllLoans();
      const response = await request(httpServer)
        .get('/api/loans')
        .set('Authorization', `Bearer ${token}`);
      logger.info({ data: response.body as Record<string, string[]> });
      expect(response.status).toBe(200);
      expect(response.body.data).toBeDefined();
    });
  });

  describe('GET /api/loans/search', () => {
    beforeEach(async () => {
      await testService.deleteAllLoans();
      await testService.deleteAllBook();
      await testService.createBook();
      await testService.createBookV2();
      await testService.createLoanMass();
    });

    it('should be able to search loans by nim', async () => {
      logger.info('should be able to search loans by nim START');
      // Cari nim yang ada
      const studentData = await testService.getStudent();
      const response = await request(httpServer)
        .get(`/api/loans/search`)
        .query({
          nim: studentData?.nim,
        })
        .set('Authorization', `Bearer ${token}`);
      logger.info({ data: response.body as Record<string, string[]> });
      expect(response.status).toBe(200);
      expect(response.body.data.length).toBeGreaterThan(0);
    });

    it('should be able to search loans by full name', async () => {
      logger.info('should be able to search loans by full name START');
      // Cari nama yang ada
      const studentData = await testService.getStudent();
      const response = await request(httpServer)
        .get(`/api/loans/search`)
        .query({
          full_name: studentData?.full_name.split(' ')[0], // Ambil nama depan saja
        })
        .set('Authorization', `Bearer ${token}`);
      logger.info({ data: response.body as Record<string, string[]> });
      expect(response.status).toBe(200);
      expect(response.body.data.length).toBeGreaterThan(0);
    });

    it('should be able to search loans by status', async () => {
      logger.info('should be able to search loans by status START');
      const response = await request(httpServer)
        .get(`/api/loans/search`)
        .query({
          status: LoanStatus.APPROVED,
        })
        .set('Authorization', `Bearer ${token}`);
      logger.info({ data: response.body as Record<string, string[]> });
      expect(response.status).toBe(200);
      expect(
        (response.body.data as { status: string }[]).some(
          (loan) => loan.status === 'APPROVED',
        ),
      ).toBe(true);
    });

    it('should be able to search loans with pagination', async () => {
      logger.info('should be able to search loans with pagination START');
      const response = await request(httpServer)
        .get(`/api/loans/search`)
        .query({
          size: 2,
          page: 1,
        })
        .set('Authorization', `Bearer ${token}`);
      logger.info({ data: response.body as Record<string, string[]> });
      expect(response.status).toBe(200);
      expect(response.body.data.length).toBeLessThanOrEqual(2);
      expect(response.body.paging.current_page).toBe(1);
      expect(response.body.paging.size).toBe(2);
    });

    it('should use default pagination when not provided', async () => {
      logger.info('should use default pagination when not provided START');
      const response = await request(httpServer)
        .get('/api/loans/search')
        .set('Authorization', `Bearer ${token}`);
      logger.info({ data: response.body as Record<string, string[]> });
      expect(response.status).toBe(200);
      expect(response.body.paging.current_page).toBe(1);
      expect(response.body.paging.size).toBe(10);
    });
  });
});
