import {
  ArgumentsHost,
  Catch,
  ExceptionFilter,
  HttpException,
  HttpStatus,
} from '@nestjs/common';
import { ZodError } from 'zod';
import { Response } from 'express';

@Catch(ZodError, HttpException)
export class ErrorFilter implements ExceptionFilter {
  catch(exception: any, host: ArgumentsHost) {
    const response = host.switchToHttp().getResponse<Response>();

    if (exception instanceof HttpException) {
      response.status(exception.getStatus()).json({
        errors: exception.getResponse(),
      });
    } else if (exception instanceof ZodError) {
      response.status(HttpStatus.BAD_REQUEST).json({
        // errors: 'Validation error',
        errors: exception.flatten().fieldErrors,
      });
    } else {
      response.status(HttpStatus.INTERNAL_SERVER_ERROR).json({
        errors: (exception as Error).message,
      });
    }
  }
}
