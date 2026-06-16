import "dotenv/config"

import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { MicroserviceOptions, Transport } from '@nestjs/microservices';

async function bootstrap() {
  const app = await NestFactory.createMicroservice<MicroserviceOptions>(AppModule, {
    transport: Transport.RMQ,
    options: {
      url: ['amqp://guest:guest@localhost:5672'],
      queue: "kitchen_queue",
      queueOptions: { duration : process.env.NODE_ENV === 'production'}
    }
  });  

  await app.listen()
  console.log("🔄 kitchen servie is listening on kitchen_queue")
}
bootstrap();
