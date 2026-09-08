import { NestFactory } from '@nestjs/core';
import { AppModule } from './auth/auth.module';
import { ConfigService } from '@nestjs/config';
import { ValidationPipe, Logger as NestLogger } from '@nestjs/common';
import { Logger as PinoLogger } from 'nestjs-pino';
import { AllExceptionsFilter } from './common/filters/all-exceptions.filter';
import { ConsulService } from './consul/consul.service';

async function bootstrap() {
  const app = await NestFactory.create(AppModule, { bufferLogs: true });
  app.useLogger(app.get(PinoLogger));

  app.useGlobalFilters(new AllExceptionsFilter());

  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
    }),
  );

  const configService = app.get(ConfigService);
  const port = configService.get<number>('PORT', 3000);
  await app.listen(port);
  const logger = new NestLogger('Bootstrap');
  logger.log(`Auth service is running on localhost:${port}`);

  app.enableShutdownHooks();
  await app.get(ConsulService).register();
}
bootstrap();
