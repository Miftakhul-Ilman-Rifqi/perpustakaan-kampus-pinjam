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
  let logger: Logger; // Gunakan tipe Logger dari winston
  let httpServer: Server; // Tambahkan variabel untuk menyimpan HTTP server

  let testService: TestService;
  let token: string;

  // Setup aplikasi sekali untuk semua test
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

  // Tutup aplikasi setelah semua test selesai
  afterAll(async () => {
    await app.close();
  });

  describe('POST /api/superadmin/login', () => {
    it('should be rejected if request is empty', async () => {
      const response = await request(httpServer)
        .post('/api/superadmin/login')
        .send({
          username: '',
          password: '',
        });

      logger.info({ data: response.body as Record<string, string[]> });

      expect(response.status).toBe(400);
      expect(response.body.errors).toBeDefined();
    });

    it('should be rejected if request is invalid', async () => {
      const response = await request(httpServer)
        .post('/api/superadmin/login')
        .send({
          username: 'rif',
          password: 'perpus',
        });

      logger.info({ data: response.body as Record<string, string[]> });

      expect(response.status).toBe(401);
      expect(response.body.errors).toBeDefined();
    });

    it('should be able to login', async () => {
      const response = await request(httpServer)
        .post('/api/superadmin/login')
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

  describe('DELETE /api/superadmin/current', () => {
    it('should be rejected if token is empty', async () => {
      const response = await request(httpServer)
        .delete('/api/superadmin/current')
        .set('Authorization', '');

      logger.info({ data: response.body as Record<string, string[]> });

      expect(response.status).toBe(401);
      expect(response.body.errors).toBeDefined();
    });

    it('should be rejected if token is invalid', async () => {
      const response = await request(httpServer)
        .delete('/api/superadmin/current')
        .set('Authorization', 'Bearer eyJhb....GOdQ');

      logger.info({ data: response.body as Record<string, string[]> });

      expect(response.status).toBe(401);
      expect(response.body.errors).toBeDefined();
    });

    it('should be able to logout user', async () => {
      // Lakukan logout
      const response = await request(httpServer)
        .delete('/api/superadmin/current')
        .set('Authorization', `Bearer ${token}`);

      logger.info({ data: response.body as Record<string, string[]> });

      expect(response.status).toBe(200);
      expect(response.body.data).toBe(true);
    });
  });
});
