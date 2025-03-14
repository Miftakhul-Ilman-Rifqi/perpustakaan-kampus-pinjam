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
    let token: string;

    beforeEach(async () => {
      token = await testService.login(httpServer);
    });

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
        .set(
          'Authorization',
          'Bearer eyJhbGciOiJSUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiI5Y2Zl3WJmZi0yYzVjLTQyODMtODkzOC00NDA1NzMzNGI2ZWQiLCJ1c2VybmFtZSI6InJpZjEyMyIsImlhdCI6MTc0MTUwMTQ0NSwiZXhwIjoxNzQxNTg3ODQ1fQ.bzxy2EYNArPf19PfEVZSRlzdVLVBQqwbHpneBSoTXNBBTB6C5Xgv-SdAzm3nLyDX-LS2qtNBi6dGOD_7XVQKmH2XdO3gEw0MOfZFsEQjLf6BshswXCjzhcWd1OUCafkeaEKyPSnFLi3ZbrtIe2-cyEWPf4qEx8xW8yrX0H12YRf8lk3QsX9iv5o96yq6NoLy82auWE1gP6-4Sm5lnmsstlQkbrqvFKbwCal7WtZ7nI23YkW4uK14Ax229hkC-HxFgezdbMJ_KjTHda6vnnABlDo89ZN1-8o3D_3WUrWKwJYEh-DVZopW62mM0YikJNM5bAqe6Z2RbK1gQxVRL4GOdQ',
        );

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
