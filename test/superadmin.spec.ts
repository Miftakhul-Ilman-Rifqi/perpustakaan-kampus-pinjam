import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import * as request from 'supertest';
import { AppModule } from '../src/app.module';
import { WINSTON_MODULE_PROVIDER } from 'nest-winston';
import { Logger as WinstonLogger } from 'winston';
import { Server } from 'http';
import { TestService } from './test.service';
import { TestModule } from './test.module';

describe('SuperadminController', () => {
  let app: INestApplication;
  let logger: WinstonLogger; // Gunakan tipe Logger dari winston
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

  describe('POST /api/users', () => {
    beforeEach(async () => {
      await testService.deleteUser();
    });

    it('should be rejected if request is invalid', async () => {
      const response = await request(httpServer).post('/api/users').send({
        username: '',
        password: '',
        name: '',
      });

      logger.info(response.body);

      expect(response.status).toBe(400);
      expect(response.body.errors).toBeDefined();
    });

    it('should be able to register', async () => {
      const response = await request(httpServer).post('/api/users').send({
        username: 'test',
        password: 'test',
        name: 'test',
      });

      logger.info(response.body);

      expect(response.status).toBe(200);
      expect(response.body.data.username).toBe('test');
      expect(response.body.data.name).toBe('test');
    });

    it('should be rejected if username already exists', async () => {
      await testService.createUser();
      const response = await request(httpServer).post('/api/users').send({
        username: 'test',
        password: 'test',
        name: 'test',
      });

      logger.info(response.body);

      expect(response.status).toBe(400);
      expect(response.body.errors).toBeDefined();
    });
  });
});
