import 'dotenv/config';

import { NestFactory } from '@nestjs/core';
import { MicroserviceOptions, Transport } from '@nestjs/microservices';
import { AppModule } from './tickets/app.module';
import { AllRpcExceptionsFilter } from './common/filters/all-rpc-exception.filter';
import { Logger } from '@nestjs/common';
import { HealthModule } from './health/health.module';
import { ConfigService } from '@nestjs/config';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  const configService = app.get(ConfigService);

  const microservice = await NestFactory.createMicroservice<MicroserviceOptions>(
    AppModule,
    {
      transport: Transport.RMQ,
      options: {
        urls: [configService.get<string>('RABBITMQ_URL')!],
        queue: 'kitchen_queue',
        queueOptions: { durable: configService.get<string>('NODE_ENV') === 'production' },
      },
    },
  );

  microservice.useGlobalFilters(new AllRpcExceptionsFilter());

  await microservice.listen();
  const logger = new Logger('Bootstrap');
  logger.log('Kitchen service listening on kitchen_queue');

  microservice.enableShutdownHooks();

  const healthApp = await NestFactory.create(HealthModule);
  const healthPort = configService.get<number>('HEALTH_PORT', 3010);
  await healthApp.listen(healthPort);
  logger.log(`Kitchen health server running on port ${healthPort}`);
}
bootstrap();
