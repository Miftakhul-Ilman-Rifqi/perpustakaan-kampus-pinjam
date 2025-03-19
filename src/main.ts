import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { WINSTON_MODULE_NEST_PROVIDER } from 'nest-winston';
import { Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { Paging, WebResponse } from './model/web.model';
import {
  //   CreateStudentRequest,
  //   GetStudentRequest,
  //   SearchStudentRequest,
  StudentResponse,
} from './model/student.model';
import {
  BookResponse,
  //   CreateBookRequest,
  //   GetBookRequest,
  //   RemoveBookRequest,
  //   SearchBookRequest,
  //   UpdateBookRequest,
} from './model/book.model';
import {
  //   CreateLoanRequest,
  //   GetLoanRequest,
  LoanResponse,
  //   RemoveLoanRequest,
  //   SearchLoanRequest,
  //   UpdateLoanRequest,
} from './model/loan.model';
import { ThrottlerExceptionFilter } from './common/throttler/throttler.filter';
import { NestExpressApplication } from '@nestjs/platform-express';
import { NextFunction, Request, Response } from 'express';

async function bootstrap() {
  const app = await NestFactory.create<NestExpressApplication>(AppModule);

  // app.enableCors();

  // Redirect root ke /api-docs
  app.use((req: Request, res: Response, next: NextFunction) => {
    if (req.url === '/') {
      return res.redirect('/api-docs');
    }
    next();
  });

  // Validasi env variables
  const configService = app.get(ConfigService);
  if (
    !configService.get('JWT_PUBLIC_KEY') ||
    !configService.get('JWT_PRIVATE_KEY')
  ) {
    throw new Error('JWT keys not configured');
  }

  // Menambahkan filter untuk throttler exception
  app.useGlobalFilters(new ThrottlerExceptionFilter());

  const logger: Logger = app.get(WINSTON_MODULE_NEST_PROVIDER);
  app.useLogger(logger);

  // Konfigurasi Swagger
  const config = new DocumentBuilder()
    .setTitle('Perpustakaan Kampus API')
    .setDescription('API dokumentasi untuk aplikasi Perpustakaan Kampus')
    .setVersion('1.0')
    .addBearerAuth(
      {
        type: 'http',
        scheme: 'bearer',
        bearerFormat: 'JWT',
        name: 'Authorization',
        description: 'Enter JWT token',
        in: 'header',
      },
      'JWT-auth',
    )
    .build();

  const document = SwaggerModule.createDocument(app, config, {
    extraModels: [
      //   CreateStudentRequest,
      //   GetStudentRequest,
      //   SearchStudentRequest,
      StudentResponse,
      BookResponse,
      //   CreateBookRequest,
      //   GetBookRequest,
      //   RemoveBookRequest,
      //   SearchBookRequest,
      //   UpdateBookRequest,
      //   CreateLoanRequest,
      //   GetLoanRequest,
      LoanResponse,
      //   RemoveLoanRequest,
      //   SearchLoanRequest,
      //   UpdateLoanRequest,
      Paging,
      WebResponse,
    ],
  });

  SwaggerModule.setup('api-docs', app, document, {
    swaggerOptions: {
      defaultModelsExpandDepth: -1, // This will hide the schemas section
    },
    // customCssUrl:
    //   'https://cdnjs.cloudflare.com/ajax/libs/swagger-ui/4.15.5/swagger-ui.min.css',
    // customJs: [
    //   'https://cdnjs.cloudflare.com/ajax/libs/swagger-ui/4.15.5/swagger-ui-bundle.js',
    //   'https://cdnjs.cloudflare.com/ajax/libs/swagger-ui/4.15.5/swagger-ui-standalone-preset.js',
    // ],
  });

  await app.listen(process.env.PORT ?? 3000);
}
bootstrap().catch((err) => {
  console.error('Error during bootstrap:', err);
});
