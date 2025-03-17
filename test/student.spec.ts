import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import * as request from 'supertest';
import { AppModule } from '../src/app.module';
import { WINSTON_MODULE_PROVIDER } from 'nest-winston';
import { Logger } from 'winston';
import { Server } from 'http';
import { TestService } from './test.service';
import { TestModule } from './test.module';

describe('StudentController', () => {
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

  describe('GET /api/students/:id', () => {
    it('should be rejected if student is not found', async () => {
      logger.info('should be rejected if student is not found START');
      const invalidUuid = '201dfe0a-adf3-442e-8c69-c709bd7aec14';

      const response = await request(httpServer)
        .get(`/api/students/${invalidUuid}`)
        .set('Authorization', `Bearer ${token}`);

      logger.info({ data: response.body as Record<string, string[]> });

      expect(response.status).toBe(404);
      expect(response.body.errors).toBeDefined();
    });

    it('should be able to get student', async () => {
      logger.info('should be able to get student START');
      const student = await testService.getUser();
      const response = await request(httpServer)
        .get(`/api/students/${student.id}`)
        .set('Authorization', `Bearer ${token}`);

      logger.info({ data: response.body as Record<string, string[]> });

      expect(response.status).toBe(200);
      expect(response.body.data.id).toBeDefined();
      expect(response.body.data.full_name).toBe('Ahmad Rifai');
      expect(response.body.data.nim).toBe('205410080');
    });
  });

  describe('GET /api/student', () => {
    it('should be able to get list student', async () => {
      logger.info('should be able to get list student START');
      const response = await request(httpServer)
        .get('/api/students/')
        .set('Authorization', `Bearer ${token}`);

      logger.info({ data: response.body as Record<string, string[]> });

      expect(response.status).toBe(200);
      expect(response.body.data.length).toBe(15);
    });

    it('should be able to search student by full_name', async () => {
      logger.info('should be able to search student by full_name START');
      const response = await request(httpServer)
        .get(`/api/students/search`)
        .query({
          full_name: 'ah',
        })
        .set('Authorization', `Bearer ${token}`);

      logger.info({ data: response.body as Record<string, string[]> });

      expect(response.status).toBe(200);
      expect(response.body.data.length).toBe(3);
    });

    it('should be able to search student by full_name not found', async () => {
      logger.info(
        'should be able to search student by full_name not found START',
      );
      const response = await request(httpServer)
        .get(`/api/students/search`)
        .query({
          full_name: 'wrong',
        })
        .set('Authorization', `Bearer ${token}`);

      logger.info({ data: response.body as Record<string, string[]> });

      expect(response.status).toBe(200);
      expect(response.body.data.length).toBe(0);
    });

    it('should be able to search student by nim', async () => {
      logger.info('should be able to search student by nim START');
      const response = await request(httpServer)
        .get(`/api/students/search`)
        .query({
          nim: '205410084',
        })
        .set('Authorization', `Bearer ${token}`);

      logger.info({ data: response.body as Record<string, string[]> });

      expect(response.status).toBe(200);
      expect(response.body.data.length).toBe(1);
    });

    it('should be able to search student by nim not found', async () => {
      logger.info('should be able to search student by nim not found START');
      const response = await request(httpServer)
        .get(`/api/students/search`)
        .query({
          nim: '205410079',
        })
        .set('Authorization', `Bearer ${token}`);

      logger.info({ data: response.body as Record<string, string[]> });

      expect(response.status).toBe(200);
      expect(response.body.data.length).toBe(0);
    });

    it('should be able to search student with page', async () => {
      logger.info('should be able to search student with page START');
      const response = await request(httpServer)
        .get(`/api/students/search`)
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

    it('should be able to search student with page v2', async () => {
      logger.info('should be able to search student with page v2 START');
      const response = await request(httpServer)
        .get(`/api/students/search`)
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
      logger.info('should use default pagination when not provided START');
      const response = await request(httpServer)
        .get('/api/students/search')
        .set('Authorization', `Bearer ${token}`);

      logger.info({ data: response.body as Record<string, string[]> });

      expect(response.status).toBe(200);
      expect(response.body.paging.current_page).toBe(1);
      expect(response.body.paging.size).toBe(10);
    });
  });
});
