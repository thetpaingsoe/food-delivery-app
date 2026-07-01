import "dotenv/config"

import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { MicroserviceOptions, Transport } from '@nestjs/microservices';

async function bootstrap() {
  const app = await NestFactory.createMicroservice<MicroserviceOptions>(AppModule, {
    transport: Transport.RMQ,
    options: {
      url: [process.env.RABBITMQ_URL],
      queue: "kitchen_queue",
      queueOptions: { durable : process.env.NODE_ENV === 'production'}
    }
  });  

  await app.listen()
  console.log("🔄 kitchen servie is listening on kitchen_queue")
}
bootstrap();
