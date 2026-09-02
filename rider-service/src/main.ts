import 'dotenv/config';

import { NestFactory } from '@nestjs/core';
import { MicroserviceOptions, Transport } from '@nestjs/microservices';
import { AppModule } from './dispatches/app.module';
import { AllRpcExceptionsFilter } from './common/filters/all-rpc-exception.filter';
import { Logger } from '@nestjs/common';

async function bootstrap() {
  const app = await NestFactory.createMicroservice<MicroserviceOptions>(
    AppModule,
    {
      transport: Transport.RMQ,
      options: {
        url: [process.env.RABBITMQ_URL],
        queue: 'rider_queue',
        queueOptions: {
          durable: process.env.NODE_ENV === 'production',
        },
      },
    },
  );

  app.useGlobalFilters(new AllRpcExceptionsFilter());

  await app.listen();
  const logger = new Logger('Bootstrap');
  logger.log('Rider service listening on rider_queue');

  app.enableShutdownHooks();
}
bootstrap();
