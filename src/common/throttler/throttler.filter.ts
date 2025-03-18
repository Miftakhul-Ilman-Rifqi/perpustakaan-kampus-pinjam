import { ExceptionFilter, Catch, ArgumentsHost, Type } from '@nestjs/common';
import { ThrottlerException } from '@nestjs/throttler';
import { Response } from 'express';

@Catch(ThrottlerException as unknown as Type<Error>)
export class ThrottlerExceptionFilter implements ExceptionFilter {
  catch(exception: ThrottlerException, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();

    response.status(429).json({
      statusCode: 429,
      message: 'Terlalu banyak permintaan, silakan coba lagi nanti',
      error: 'Too Many Requests',
    });
  }
}
