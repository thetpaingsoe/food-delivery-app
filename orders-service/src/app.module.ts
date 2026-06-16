import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { ClientsModule, Transport } from '@nestjs/microservices';
import { duration } from 'drizzle-orm/gel-core';

@Module({
  imports: [
    ClientsModule.register([
      {
        name: 'KITCHEN_SERVICE',
        transport: Transport.RMQ,
        options: {
          urls: ['amqp://guest:guest@localhost:5670'],
          queue: "kitchen_queue",
          queueOptions: {duration: false}
        }
      }
    ])
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
