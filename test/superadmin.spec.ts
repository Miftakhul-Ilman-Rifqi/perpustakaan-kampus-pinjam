import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import * as request from 'supertest';
import { AppModule } from '../src/app.module';
import { WINSTON_MODULE_PROVIDER } from 'nest-winston';
import { Logger } from 'winston';
import { Server } from 'http';
import { TestService } from './test.service';
import { TestModule } from './test.module';

describe('SuperadminController', () => {
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

  describe('POST /api/superadmins/login', () => {
    it('should be rejected if request is empty', async () => {
      logger.info('should be rejected if request is empty START');
      const response = await request(httpServer)
        .post('/api/superadmins/login')
        .send({
          username: '',
          password: '',
        });

      logger.info({ data: response.body as Record<string, string[]> });

      expect(response.status).toBe(400);
      expect(response.body.errors).toBeDefined();
    });

    it('should be rejected if request is invalid', async () => {
      logger.info('should be rejected if request is invalid START');
      const response = await request(httpServer)
        .post('/api/superadmins/login')
        .send({
          username: 'rif',
          password: 'perpus',
        });

      logger.info({ data: response.body as Record<string, string[]> });

      expect(response.status).toBe(401);
      expect(response.body.errors).toBeDefined();
    });

    it('should be able to login', async () => {
      logger.info('should be able to login START');
      const response = await request(httpServer)
        .post('/api/superadmins/login')
        .send({
          username: 'rif123',
          password: 'perpuskampis',
        });

      logger.info({ data: response.body as Record<string, string[]> });

      expect(response.status).toBe(200);
      expect(response.body.data.username).toBe('rif123');
      expect(response.body.data.full_name).toBe('Miftakhul Ilman Rifqi');
      expect(response.body.data.token).toBeDefined();
    });
  });

  describe('DELETE /api/superadmins/current', () => {
    it('should be rejected if token is empty', async () => {
      logger.info('should be rejected if token is empty START');
      const response = await request(httpServer)
        .delete('/api/superadmins/current')
        .set('Authorization', '');

      logger.info({ data: response.body as Record<string, string[]> });

      expect(response.status).toBe(401);
      expect(response.body.errors).toBeDefined();
    });

    it('should be rejected if token is invalid', async () => {
      logger.info('should be rejected if token is invalid START');
      const response = await request(httpServer)
        .delete('/api/superadmins/current')
        .set('Authorization', 'Bearer eyJhb....GOdQ');

      logger.info({ data: response.body as Record<string, string[]> });

      expect(response.status).toBe(401);
      expect(response.body.errors).toBeDefined();
    });

    it('should be able to logout user', async () => {
      logger.info('should be able to logout user START');
      const response = await request(httpServer)
        .delete('/api/superadmins/current')
        .set('Authorization', `Bearer ${token}`);

      logger.info({ data: response.body as Record<string, string[]> });

      expect(response.status).toBe(200);
      expect(response.body.data).toBe(true);
    });
  });
});
