import { NestFactory } from '@nestjs/core';
import { AppModule } from './items/items.module';
import { ConfigService } from '@nestjs/config';
import { ValidationPipe } from '@nestjs/common';
import { AllExceptionsFilter } from './common/filters/all-exceptions.filter';
import { ConsulService } from './consul/consul.service';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  app.useGlobalFilters(new AllExceptionsFilter());

  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
    }),
  );

  const configService = app.get(ConfigService);
  const port = configService.get<number>('PORT', 3001);
  await app.listen(port);
  console.log(`Item service is running on localhost:${port}`);

  await app.get(ConsulService).register();

  app.enableShutdownHooks();
}
bootstrap();
