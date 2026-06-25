import 'dotenv/config';

import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { MicroserviceOptions, Transport } from '@nestjs/microservices';
import { duration } from 'drizzle-orm/gel-core';

async function bootstrap() {
  const app = await NestFactory.createMicroservice<MicroserviceOptions>(
    AppModule, 
    {
      transport: Transport.RMQ,
      options : {
        url : ['amqp://guest:guest@localhost:5672'],
        queue: 'rider_queue',
        queueOptions : {
          durable: process.env.NODE_ENV === 'production'
        }
      }
    }
  )

  await app.listen();
  console.log("🔄 Rider Serivce is listening on rider_queue")
}
bootstrap();
