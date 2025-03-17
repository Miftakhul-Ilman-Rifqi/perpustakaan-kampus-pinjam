// import { Test, TestingModule } from '@nestjs/testing';
// import { INestApplication } from '@nestjs/common';
// import { AppModule } from '../src/app.module';
// import { WINSTON_MODULE_PROVIDER } from 'nest-winston';
// import { Logger } from 'winston';
// import { Server } from 'http';
// import { TestService } from './test.service';
// import { TestModule } from './test.module';

// export interface TestFixtures {
//   app: INestApplication;
//   logger: Logger;
//   httpServer: Server;
//   testService: TestService;
//   token: string;
// }

// export async function setupTestEnvironment(): Promise<TestFixtures> {
//   const moduleFixture: TestingModule = await Test.createTestingModule({
//     imports: [AppModule, TestModule],
//   }).compile();

//   const app = moduleFixture.createNestApplication();
//   await app.init();

//   const logger = app.get<Logger>(WINSTON_MODULE_PROVIDER);
//   const httpServer = app.getHttpServer() as Server;
//   const testService = app.get(TestService);

//   const token = await testService.login(httpServer);

//   return { app, logger, httpServer, testService, token };
// }

// export function loggedDescribe(description: string, suite: () => void) {
//   describe(description, () => {
//     let logger: Logger;

//     beforeAll(async () => {
//       const fixtures = await setupTestEnvironment();
//       logger = fixtures.logger;
//       logger.info(`${description} START`);
//     });

//     afterAll(() => {
//       if (logger) {
//         logger.info(`${description} END`);
//       }
//     });

//     suite();
//   });
// }

// export function loggedIt(
//   description: string,
//   testFn: () => void | Promise<void>,
// ) {
//   let logger: Logger;

//   beforeAll(async () => {
//     const fixtures = await setupTestEnvironment();
//     logger = fixtures.logger;
//   });

//   it(description, async () => {
//     try {
//       await testFn();
//     } finally {
//       if (logger) {
//         logger.info(`${description} END`);
//       }
//     }
//   });
// }
