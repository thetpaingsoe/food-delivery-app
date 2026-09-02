import 'dotenv/config';

import { NestFactory } from '@nestjs/core';
import { MicroserviceOptions, Transport } from '@nestjs/microservices';
import { AppModule } from './tickets/app.module';
import { AllRpcExceptionsFilter } from './common/filters/all-rpc-exception.filter';
import { Logger } from '@nestjs/common';
import { HealthModule } from './health/health.module';

async function bootstrap() {
  const app = await NestFactory.createMicroservice<MicroserviceOptions>(
    AppModule,
    {
      transport: Transport.RMQ,
      options: {
        url: [process.env.RABBITMQ_URL],
        queue: 'kitchen_queue',
        queueOptions: { durable: process.env.NODE_ENV === 'production' },
      },
    },
  );

  app.useGlobalFilters(new AllRpcExceptionsFilter());

  await app.listen();
  const logger = new Logger('Bootstrap');
  logger.log('Kitchen service listening on kitchen_queue');

  app.enableShutdownHooks();

  const healthApp = await NestFactory.create(HealthModule);
  const healthPort = process.env.HEALTH_PORT || 3010;
  await healthApp.listen(healthPort);
  logger.log(`Kitchen health server running on port ${healthPort}`);
}
bootstrap();
