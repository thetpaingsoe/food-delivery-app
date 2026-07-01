import 'dotenv/config';

import { NestFactory } from '@nestjs/core';
import { MicroserviceOptions, Transport } from '@nestjs/microservices';
import { AppModule } from './dispatches/app.module';

async function bootstrap() {
  const app = await NestFactory.createMicroservice<MicroserviceOptions>(
    AppModule, 
    {
      transport: Transport.RMQ,
      options : {
        url : [process.env.RABBITMQ_URL],
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
