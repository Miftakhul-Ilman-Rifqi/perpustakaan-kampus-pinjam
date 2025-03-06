import { Global, Module } from '@nestjs/common';
// import { Global, MiddlewareConsumer, Module, NestModule } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { WinstonModule } from 'nest-winston';
import * as winston from 'winston';
import * as chalk from 'chalk';
import { PrismaService } from './prisma.service';
// import { ValidationService } from './validation.service';
// import { ErrorFilter } from './error.filter';
// import { APP_FILTER } from '@nestjs/core';
// import { AuthMiddleware } from './auth.middleware';

// Define interfaces
interface QueryMessage {
  query: string;
  params: unknown[];
  duration: number;
  target?: string;
  timestamp?: string;
}

interface ErrorMessage {
  errors: string;
}

interface DataMessage {
  data: Record<string, unknown>;
}

type LogMessage = string | QueryMessage | ErrorMessage | DataMessage;

// Type guards
function isString(value: unknown): value is string {
  return typeof value === 'string';
}

function isQueryMessage(value: unknown): value is QueryMessage {
  return Boolean(value && typeof value === 'object' && 'query' in value);
}

function isErrorMessage(value: unknown): value is ErrorMessage {
  return Boolean(value && typeof value === 'object' && 'errors' in value);
}

function isDataMessage(value: unknown): value is DataMessage {
  return Boolean(value && typeof value === 'object' && 'data' in value);
}

@Global()
@Module({
  imports: [
    WinstonModule.forRoot({
      level: 'debug',
      format: winston.format.combine(
        winston.format.timestamp(),
        winston.format.printf((info: winston.Logform.TransformableInfo) => {
          const timestamp = String(info.timestamp);
          const message = info.message as LogMessage;
          const divider = '─'.repeat(50);

          // Database connection message
          if (isString(message) && message.includes('Starting a mysql pool')) {
            return `\n🔌 ${chalk.blue('Database Connection')} [${timestamp}]\n${message}\n${divider}\n`;
          }

          // Query message
          if (isQueryMessage(message)) {
            return `\n📋 ${chalk.yellow('Query')} [${timestamp}]
Query: ${chalk.green(message.query)}
Params: ${chalk.cyan(JSON.stringify(message.params))}
Duration: ${chalk.yellow(`${message.duration}ms`)}
${divider}\n`;
          }

          // Error message
          if (isErrorMessage(message)) {
            return `\n❌ ${chalk.red('Error')} [${timestamp}]
${chalk.red(message.errors)}
${divider}\n`;
          }

          // Response data message
          if (isDataMessage(message)) {
            return `\n✅ ${chalk.green('Response')} [${timestamp}]
${chalk.cyan(JSON.stringify(message.data, null, 2))}
${divider}\n`;
          }

          // Default message
          return `[${timestamp}] ${info.level}: ${
            isString(message) ? message : JSON.stringify(message, null, 2)
          }\n`;
        }),
      ),
      transports: [new winston.transports.Console()],
    }),
    ConfigModule.forRoot({
      isGlobal: true,
    }),
  ],
  providers: [
    PrismaService,
    // ValidationService,
    // {
    //     provide: APP_FILTER,
    //     useClass: ErrorFilter,
    // },
  ],
  exports: [PrismaService],
  //   exports: [PrismaService, ValidationService],
})
export class CommonModule {}
// export class CommonModule implements NestModule {
//   configure(consumer: MiddlewareConsumer) {
//     consumer.apply(AuthMiddleware).forRoutes('/api/*');
//   }
// }
